import { Request, Response } from "express";
import { prisma } from "../db/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

async function register(req: Request, res: Response) {
  if (!req.body.email || !req.body.password) {
    return res.status(400).json({ error: "No email or password" });
  }

  const normalizedEmail = req.body.email.toLowerCase().trim();

  try {
    const passwordHash = await bcrypt.hash(req.body.password, 10);
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return res.status(409).json({ error: "User already exists" });
    }

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash: passwordHash,
        // Поля с @default не указываем!
      },
    });

    return res.status(201).json({
      message: "Успешная регистрация",
      user: { id: user.id, email: user.email },
    });
  } catch (e: unknown) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function login(req: Request, res: Response) {
  if (!req.body.email || !req.body.password) {
    return res.status(400).json({ error: "No email or password" });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret)
      return res.status(500).json({ error: "JWT secret not configured" });

    const user = await prisma.user.findUnique({
      where: { email: req.body.email },
    });

    if (!user) {
      return res
        .status(401)
        .json({ error: `There is no user with email ${req.body.email}` });
    }

    const isPassCompare = await bcrypt.compare(
      req.body.password,
      user.passwordHash,
    );
    if (!isPassCompare)
      return res.status(401).json({ error: "Wrong email or password" });

    const payload = {
      userId: user.id,
      email: user.email,
    };

    const token = jwt.sign(payload, jwtSecret, { expiresIn: "7d" });
    return res.status(200).json({
      message: "Successful login",
      token: token,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (e: unknown) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

export { register, login };
