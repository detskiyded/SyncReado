import { Router } from "express";
import { searchUsers } from "../controllers/userController";

const userRouter = Router();

userRouter.get("/search", searchUsers);

export { userRouter };
