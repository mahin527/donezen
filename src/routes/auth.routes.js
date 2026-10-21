import { Router } from "express";
import {
    getMe,
    register,
    login,
    verifyEmail,
    refreshToken,
    logout,
    logoutAll,
} from "../controllers/auth.controller.js";
import {
    authLimiter,
    credentialLimiter,
} from "../middlewares/rateLimit.middleware.js";

const authRouter = Router();

authRouter.post("/register", credentialLimiter, register);
authRouter.post("/verify-email", credentialLimiter, verifyEmail);
authRouter.post("/login", credentialLimiter, login);
authRouter.get("/logout", authLimiter, logout);
authRouter.get("/logout-all", authLimiter, logoutAll);
authRouter.get("/get-me", authLimiter, getMe);
authRouter.get("/refresh", authLimiter, refreshToken);

export default authRouter;
