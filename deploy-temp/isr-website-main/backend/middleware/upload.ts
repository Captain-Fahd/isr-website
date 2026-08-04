import { Request } from "express";
import multer, { FileFilterCallback } from "multer";

// Buffer uploads in memory so they can be streamed straight to Supabase Storage.
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (
    _req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback,
  ) => cb(null, file.mimetype.startsWith("image/")),
});
