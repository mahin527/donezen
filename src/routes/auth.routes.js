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

const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/verify-email", verifyEmail);
authRouter.post("/login", login);
authRouter.get("/logout", logout);
authRouter.get("/logout-all", logoutAll);
authRouter.get("/get-me", getMe);
authRouter.get("/refresh", refreshToken);

export default authRouter;
