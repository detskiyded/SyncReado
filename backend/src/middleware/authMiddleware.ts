import { Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { AuthRequest } from "../types/auth";

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Требуется авторизация" });
  }

  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Неверный формат токена" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded as JwtPayload & { userId: string };
    next();
  } catch (error) {
    return res.status(401).json({ error: "Неверный токен" });
  }
};
