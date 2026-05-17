import multer from 'multer';

export const storage = multer.memoryStorage();

import { Request } from 'express';
import { FileFilterCallback } from 'multer';
import { Express } from 'express-serve-static-core';
const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const allowed = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Geçersiz dosya türü'));
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});
