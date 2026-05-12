import { Router } from "express";
import { getAllBooks, getBookById } from "../controllers/bookController";

const bookRouter = Router();

bookRouter.get("/", getAllBooks);

bookRouter.get("/:id", getBookById);

export { bookRouter };
