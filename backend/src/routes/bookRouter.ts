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

bookRouter.post("/", uploadBookPdf, createBook);

bookRouter.get("/", getUserBooks);

bookRouter.get("/:id", getBookById);

bookRouter.delete("/:id", deleteBook);

export { bookRouter };
