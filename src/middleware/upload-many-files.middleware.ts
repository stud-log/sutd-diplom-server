import { NextFunction, Request, Response } from 'express';

import multer from 'multer';
import path from 'path';

/**
 * Middleware для загрузки нескольких файлов.
 * @param filenames Массив имен файлов, которые нужно загрузить.
 * @param filepath Путь для сохранения файлов (необязательный).
 * @param maxCount Максимальное количество файлов для каждого имени (необязательный).
 */
export const uploadFiles = (filenames: string[], filepath?: string, maxCount: number = 1) => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join('src', 'static', filepath || '')),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
  });
  const upload = multer({ storage });
  const cpUpload = upload.fields(filenames.map(name => ({ name, maxCount })));

  cpUpload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // Обработка ошибки Multer.
    } else if (err) {
      console.log(err);
    }
    // Всё прошло успешно.
    next();
  });
};
