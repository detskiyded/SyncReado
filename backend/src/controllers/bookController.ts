import { Response, Request } from "express";
import { Book } from "../types/book";

const books: Book[] = [
  {
    id: "1",
    title: "Smth 1",
    author: "I. D. Kno",
    createdAt: "2026-05-10",
  },
  {
    id: "2",
    title: "Smth 2",
    author: "I. D. Kno",
    createdAt: "2026-05-11",
  },
  {
    id: "3",
    title: "Nothing 1",
    author: "I. D. Kno",
    createdAt: "2026-05-10",
  },
  {
    id: "4",
    title: "Nothing 2",
    author: "I. D. Kno",
    createdAt: "2026-05-11",
  },
];

function getAllBooks(req: Request, res: Response) {
  res.json(books);
}

function getBookById(req: Request, res: Response) {
  const bookId = req.params.id as string;
  const book = books.find((b) => b.id === bookId);

  if (!book) return res.status(404).json({error: `There is no book with id: ${bookId}`});

  res.json(book);
}

export { getAllBooks, getBookById };
