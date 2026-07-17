import { Router } from "express";
import {
  createBook,
  getUserBooks,
  deleteBook,
  getBookById,
} from "../controllers/bookController";
import { authMiddleware } from "../middleware/authMiddleware";
import { uploadBookPdf } from "../middleware/upload";

const bookRouter = Router();

bookRouter.post("/", authMiddleware, uploadBookPdf, createBook);

bookRouter.get("/", authMiddleware, getUserBooks);

bookRouter.get("/:id", authMiddleware, getBookById);

bookRouter.delete("/:id", authMiddleware, deleteBook);

export { bookRouter };
