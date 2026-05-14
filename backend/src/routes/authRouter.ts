import express from "express";
import { register, login } from "../controllers/authController";

const authRouter = express.Router();

authRouter.post("/login", login);
authRouter.post("/register", register);

export { authRouter };
