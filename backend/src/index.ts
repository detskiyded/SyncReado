import express, { Request, Response } from "express";
import { bookRouter } from "./routes/bookRouter";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use("/books", bookRouter);
app.use("/books/:id", bookRouter);

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
