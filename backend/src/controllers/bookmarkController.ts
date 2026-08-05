import { Response, NextFunction } from "express";
import { prisma } from "../db/client";

import { AuthRequest } from "../types/auth";

async function addBookmark(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  const bookId = req.params.bookId as string;
  const userId = req.user?.userId;
  const { pageNumber, note } = req.body;

  if (!pageNumber || pageNumber < 1) {
    return res.status(400).json({ err: "Некорректный номер страницы" });
  }

  const newBookmark = await prisma.bookmark.create({
    data: {
      pageNumber: pageNumber,
      note: note,
      user: { connect: { id: userId } },
      book: { connect: { id: bookId } },
    },
  });

  return res.status(201).json(newBookmark);
}

async function getBookmarks(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  const bookId = req.params.bookId as string;
  const userId = req.user?.userId;

  const foundBookmarks = await prisma.bookmark.findMany({
    where: { bookId, userId },
    orderBy: { createdAt: "desc" },
  });

  return res.status(200).json(foundBookmarks);
}

async function deleteBookmark(req: AuthRequest, res: Response, next: NextFunction) {
  const bookmarkId = req.params.id as string;
  const userId = req.user?.userId;

  const bookmark = await prisma.bookmark.findUnique({
    where: {id: bookmarkId}
  });

  if (!bookmark) {
    return res.status(404).json({err: 'Нет такой закладки'});
  }

  if (bookmark.userId !== userId) {
    return res.status(403).json({err: 'Не создатель'});
  }

  await prisma.bookmark.delete({where: {id: bookmarkId}});

  return res.status(200).json({message: 'Закладка удалена'});
}

export {addBookmark, getBookmarks, deleteBookmark}
