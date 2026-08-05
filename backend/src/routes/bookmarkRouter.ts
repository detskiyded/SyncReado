import { Router } from "express";
import { addBookmark, deleteBookmark, getBookmarks } from "../controllers/bookmarkController";
import { authMiddleware } from "../middleware/authMiddleware";

const bookmarkRouter = Router({mergeParams: true});

bookmarkRouter.post('/', addBookmark);
bookmarkRouter.get('/', getBookmarks);
bookmarkRouter.delete('/:id', deleteBookmark);

export {bookmarkRouter};
