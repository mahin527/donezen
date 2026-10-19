import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "user is required"],
        },
        refreshTokenHash: {
            type: String,
            required: [true, "refresh token hash is required"],
        },
        ip: {
            type: String,
            required: [true, "ip address is required"],
        },
        userAgent: {
            type: String,
            required: [true, "user agnet is required"],
        },
        revoked: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true },
);

export const sessionModel = mongoose.model("Session", sessionSchema);
