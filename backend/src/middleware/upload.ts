import { FileFilterCallback, diskStorage } from "multer";
import multer from "multer";
import { Request, Response } from "express";
import { randomUUID } from "node:crypto";

const storage = diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/books");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${randomUUID()}.pdf`);
  },
});

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  callback: FileFilterCallback,
) => {
  if (file.mimetype === "application/pdf") {
    callback(null, true);
  } else {
    callback(null, false);
  }
};

const limits = { fileSize: 50 * 1024 * 1024 };

export const uploadBookPdf = multer({ storage, fileFilter, limits }).single(
  "pdf",
);
