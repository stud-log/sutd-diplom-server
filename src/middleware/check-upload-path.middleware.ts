import { NextFunction, Request, Response } from 'express';

import { ApiError } from '../shared/error/ApiError';
import fs from 'fs';
import path from 'path';

/**
 * Middleware для проверки существования указанного пути загрузки файлов и создания этой папки, если она не существует.
 * @param uploadPath Путь для загрузки файлов.
 */
export const checkUploadPath = (uploadPath: string) => (req: Request, res: Response, next: NextFunction) => {
  const resolvedPath = path.resolve(`src/static/${uploadPath}`);

  fs.stat(resolvedPath, function (err, stats) {
    if (!err && stats.isDirectory()) {
      return next();
    } else {
      fs.mkdir(resolvedPath, function (err) {
        if (err) {
          console.log('Ошибка при создании папки', err);
          return next(ApiError.badRequest('Ошибка при создании папки'));
        }
        return next();
      });
    }
  });
};
