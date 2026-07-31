import { Router } from "express";
import { getProgress, setProgress } from "../controllers/progressController";
import { authMiddleware } from "../middleware/authMiddleware";

const progressRouter = Router();

progressRouter.get("/:id/progress", authMiddleware, getProgress);

progressRouter.post("/:id/progress", authMiddleware, setProgress);

export { progressRouter };
