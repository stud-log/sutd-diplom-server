import { NextFunction, Request, Response } from 'express';

import multer from 'multer';
import path from 'path';

/**
 * Middleware для загрузки одного файла.
 * @param filename Имя файла, который нужно загрузить.
 * @param filepath Путь для сохранения файла (необязательный). Будет static/filepath
 */
export const uploadFile = (filename: string, filepath?: string) => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join('src', 'static', filepath || '/')),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
  });
  const upload = multer({ storage }).single(filename);

  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // Обработка ошибки Multer.
      console.log(err);
    } else if (err) {
      console.log(err);
    }
    // Всё прошло успешно.
    next();
  });
};