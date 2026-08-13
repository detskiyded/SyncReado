import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import express, { Request, Response } from "express";
import { bookRouter } from "./routes/bookRouter";
import { authMiddleware } from "./middleware/authMiddleware";
import { authRouter } from "./routes/authRouter";
import { progressRouter } from "./routes/progressRouter";
import * as path from "node:path";
import { bookmarkRouter } from "./routes/bookmarkRouter";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());


app.use("/auth", authRouter);
app.use("/books/:bookId/bookmarks", authMiddleware, bookmarkRouter);
app.use("/books", authMiddleware, progressRouter);
app.use("/books", authMiddleware, bookRouter);

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/api/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    message: "its alive!",
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
  console.log(`http://localhost:${PORT}/api/health`);
});
