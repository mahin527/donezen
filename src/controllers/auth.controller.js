import { userModel } from "../models/user.model.js";
import { sessionModel } from "../models/session.model.js";

import crypto from "crypto";
import jwt from "jsonwebtoken";
import { conf } from "../config/config.js";
import { sendEmail } from "../services/email.service.js";
import { generateOtp, getOtpHtml } from "../utils/utils.js";
import { otpModel } from "../models/otp.model.js";

export async function register(req, res) {
    const { username, email, password } = req.body;

    try {
        if (!username || !email || !password) {
            return res.status(400).json({ message: "all fields required" });
        }

        const isAlreadyRegistered = await userModel.findOne({
            $or: [{ username }, { email }],
        });

        if (isAlreadyRegistered) {
            res.status(409).json({
                message: "username or email already exists",
            });
            return;
        }

        const hashedPassword = crypto
            .createHash("sha256")
            .update(password)
            .digest("hex");

        const user = await userModel.create({
            username,
            email,
            password: hashedPassword,
        });

        const otp = generateOtp();
        const otpHtml = getOtpHtml(otp);

        const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
        await otpModel.create({
            email,
            user: user._id,
            otpHash,
        });

        await sendEmail(
            email,
            "OTP Verification",
            `Your OTP code is ${otp}`,
            otpHtml,
        );

        res.status(201).json({
            message: "user registered successfully",
            user: {
                username: user.username,
                email: user.email,
                verified: user.verified,
            },
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: error.message,
        });
    }
}

export async function logout(req, res) {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        return res.status(400).json({
            message: "refresh token not found",
        });
    }

    const refreshTokenHash = crypto
        .createHash("sha256")
        .update(refreshToken)
        .digest("hex");

    const session = await sessionModel.findOne({
        refreshTokenHash,
        revoked: false,
    });

    if (!session) {
        return res.status(400).json({
            message: "session not found",
        });
    }
    session.revoked = true;
    await session.save();

    res.clearCookie("refreshToken");

    res.status(200).json({
        message: "logged out successfully",
    });
}

export async function logoutAll(req, res) {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({
            message: "refresh token not found ",
        });
    }

    const decoded = jwt.verify(refreshToken, conf.jwt_secret);

    await sessionModel.updateMany(
        {
            user: decoded.id,
            revoked: false,
        },
        {
            revoked: true,
        },
    );

    res.status(200).json({
        message: "logged out successfully from all devices",
    });
}

export async function login(req, res) {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
        return res.status(401).json({
            message: "invalid credentials",
        });
    }

    if (!user.verified) {
        return res.status(401).json({
            message: "your email is not verified",
        });
    }

    const hashedpassword = crypto
        .createHash("sha256")
        .update(password)
        .digest("hex");
    const isPasswordValid = hashedpassword === user.password;

    if (!isPasswordValid) {
        return res.status(401).json({
            message: "invalid credentials",
        });
    }

    const refreshToken = jwt.sign(
        {
            id: user._id,
        },
        conf.jwt_secret,
        {
            expiresIn: "7d",
        },
    );

    const refreshTokenHash = crypto
        .createHash("sha256")
        .update(refreshToken)
        .digest("hex");

    const session = await sessionModel.create({
        user: user._id,
        refreshTokenHash,
        ip: req.ip,
        userAgent: req.headers["user-agent"],
    });

    const accessToken = jwt.sign(
        {
            id: user._id,
            sessionId: session._id,
        },
        conf.jwt_secret,
        {
            expiresIn: "15m",
        },
    );

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7days
    });

    res.status(201).json({
        message: "user logged in successfully",
        token: {
            accessToken,
            refreshToken,
        },
    });
}

export async function getMe(req, res) {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({
            message: "unauthorized",
        });
    }

    const decoded = jwt.verify(token, conf.jwt_secret);

    const user = await userModel.findById(decoded.id);
    res.status(200).json({
        message: "user fetched successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
        },
    });
}

export async function refreshToken(req, res) {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({
            message: "refresh token not found ",
        });
    }

    const decoded = jwt.verify(refreshToken, conf.jwt_secret);

    const refreshTokenHash = crypto
        .createHash("sha256")
        .update(refreshToken)
        .digest("hex");

    const session = await sessionModel.findOne({
        refreshTokenHash,
        revoked: false,
    });

    if (!session) {
        return res.status(401).json({
            message: "session is revoked",
        });
    }

    const accessToken = jwt.sign(
        {
            id: decoded.id,
        },
        conf.jwt_secret,
        {
            expiresIn: "15m",
        },
    );

    const NewRefreshToken = jwt.sign(
        {
            id: decoded.id,
        },
        conf.jwt_secret,
        {
            expiresIn: "7d",
        },
    );

    const NewRefreshTokenHash = crypto
        .createHash("sha256")
        .update(NewRefreshToken)
        .digest("hex");

    session.refreshTokenHash = NewRefreshTokenHash;
    await session.save();

    res.cookie("refreshToken", NewRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7days
    });

    res.status(200).json({
        message: "access token refreshed successfully",
        accessToken,
    });
}

export async function verifyEmail(req, res) {
    const { email, otp } = req.body;
    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
    const otpDoc = await otpModel.findOne({
        email,
        otpHash,
    });

    if (!otpDoc) {
        return res.status(400).json({
            message: "invalid otp",
        });
    }

    const user = await userModel.findOneAndUpdate(
        { _id: otpDoc.user },
        { verified: true },
        { new: true },
    );

    await otpModel.deleteMany({
        user: otpDoc.user,
    });

    return res.status(200).json({
        message: "Email verified successfully",
        user: {
            username: user.username,
            email: user.email,
            verified: user.verified,
        },
    });
}
