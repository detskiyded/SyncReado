import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import express, { Request, Response } from "express";
import { bookRouter } from "./routes/bookRouter";
import { authMiddleware } from "./middleware/authMiddleware";
import { authRouter } from "./routes/authRouter";
import * as path from "node:path";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/auth", authRouter);
app.use("/auth", authRouter);
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
