import { FieldValidationError, ValidationError, validationResult } from 'express-validator';
import { NextFunction, Request, Response } from 'express';

import { ApiError } from '../shared/error/ApiError';

export const validateRequestMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const errorFormatter = (error: ValidationError) => {
    if (error.type === 'field') {
      return `Поле ${error.path} заполнено не верно`;
    }
    return `[${error.type}]: ${error.msg}`;
  };
  const errors = validationResult(req).formatWith(errorFormatter);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(ApiError.badFormData(errors.array().join()));
  }
  next();
};
