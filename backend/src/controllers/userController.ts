import { AuthRequest } from "./bookController";
import { Response, NextFunction } from "express";
import { prisma } from "../db/client";

async function searchUsers(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  const query = req.query.q?.toString().trim();
  const userId = req.user?.userId;

  if (!query || query.length < 3) {
    return res.status(400).json({ err: "Слишком короткий запрос" });
  }

  const users = await prisma.user.findMany({
    where: {
      email: {
        contains: query,
        mode: "insensitive",
      },
      id: {
        not: userId,
      },
    },
    select: { id: true, email: true },
    take: 10,
  });

  return res.status(200).json(users);
}

export { searchUsers };
