import { Request, Response, NextFunction } from "express";
import { prisma } from "../db/client";

import { JwtPayload } from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: JwtPayload & { userId: string };
}

async function setProgress(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  const bookId = req.params.id as string;
  const userId = req.user?.userId;
  const { currentPage } = req.body;

  if (!userId) {
    return res.status(401).json({ error: "Auth needed!" });
  }

  await prisma.readingProgress.upsert({
    where: {
      userId_bookId: {
        userId: userId,
        bookId: bookId,
      },
    },
    update: { currentPage: currentPage },
    create: {
      userId: userId,
      bookId: bookId,
      currentPage: currentPage,
    },
  });
}

async function getProgress(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  const { bookId } = req.params as { bookId: string };
  const userId = req.user?.userId;

  const progress = await prisma.readingProgress.findFirst({
    where: {
      userId: userId,
      bookId: bookId,
    },
  });

  if (!progress) {
    return res.status(200).json({ currentPage: 1 });
  }

  return res.status(200).json(progress);
}

export { setProgress, getProgress };
