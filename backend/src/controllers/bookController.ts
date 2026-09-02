import { Response, Request, NextFunction } from "express";
import { prisma } from "../db/client";
import * as fs from "fs/promises";
import { AuthRequest } from "../types/auth";

import { JwtPayload } from "jsonwebtoken";
import path from "path";



async function createBook(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.file) {
    return res.status(400).json({ error: "Файл не загружен" });
  }

  if (!req.user) {
    return res.status(409).json({ error: "Требуется авторизация" });
  }

  const userId = req.user.userId;

  const { title, author } = req.body;
  const pdfUrl = req.file.path;

  const book = await prisma.book.create({
    data: {
      title,
      author,
      pdfUrl,
      owner: { connect: { id: userId } },
    },
  });

  return res.status(201).json({
    message: "Книга успешно создана",
    book: { book },
  });
}

async function getUserBooks(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  if (!req.user) {
    return res.status(409).json({ error: "Требуется авторизация" });
  }

  const books = await prisma.book.findMany({ where: { ownerId: req.user.userId } });

  return res.status(200).json(books);
}

async function getBookById(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  const bookId = req.params.id as string;
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ error: "Auth needed!" });
  }

  try {
    const book = await prisma.book.findUnique({ where: { id: bookId } });

    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    // Владелец — полный доступ, как раньше
    if (book.ownerId === userId) {
      return res.status(200).json(book);
    }

    // Не владелец: пускаем, если состоит в комнате с этой книгой
    const room = await prisma.room.findFirst({
      where: {
        bookId: book.id,
        roomMembers: { some: { userId } },
      },
    });

    if (!room) {
      return res.status(403).json({ error: "No access to this book" });
    }

    return res.status(200).json(book);
  } catch (err) {
    next(err);
  }
}

async function deleteBook(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(409).json({ error: "Требуется авторизация" });
  }

  const id = req.params.id as string;

  const book = await prisma.book.findUnique({
    where: { id },
  });

  if (!book) {
    return res.status(404).json({ error: "Книга не найдена" });
  }

  if (book.ownerId !== req.user.userId) {
    return res.status(403).json({ error: "Не создатель" });
  }

  await prisma.readingProgress.deleteMany({ where: { bookId: id } });
  await prisma.bookmark.deleteMany({ where: { bookId: id } });

  const filePath = path.join(__dirname, "../../", book.pdfUrl);
  try {
    await fs.rm(filePath, { force: true });
  } catch (fileError) {
    console.warn("Не удалось удалить физический файл: ", fileError);
  }

  await prisma.book.delete({
    where: { id },
  });

  return res.status(200).json({ message: "Книга удалена" });
}

export { createBook, getUserBooks, deleteBook, getBookById };
