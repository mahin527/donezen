import { Router } from "express";
import {
    getMe,
    register,
    refreshToken,
    logout,
} from "../controllers/auth.controller.js";

const authRouter = Router();

authRouter.post("/register", register);
authRouter.get("/logout", logout);
authRouter.get("/get-me", getMe);
authRouter.get("/refresh", refreshToken);

export default authRouter;
