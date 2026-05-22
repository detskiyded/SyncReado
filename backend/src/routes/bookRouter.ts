import { Router } from "express";
import { createBook, getUserBooks, deleteBook } from "../controllers/bookController";
import { authMiddleware } from "../middleware/authMiddleware";
import { uploadBookPdf } from "../middleware/upload";

const bookRouter = Router();

bookRouter.post('/', authMiddleware, uploadBookPdf, createBook);

bookRouter.get('/', authMiddleware, getUserBooks);

bookRouter.delete('/:id', authMiddleware, deleteBook);

export { bookRouter };
