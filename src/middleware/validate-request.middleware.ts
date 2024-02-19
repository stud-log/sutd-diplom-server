import { NextFunction, Request, Response } from 'express';
import { validationResult, ValidationError } from 'express-validator';
import { ApiError } from '../shared/error/ApiError';

export const validateRequestMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const errorFormatter = ({ type, msg }: ValidationError) => {
    return `[${type}]: ${msg}`;
  };
  const errors = validationResult(req).formatWith(errorFormatter);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(ApiError.badFormData(errors.array().join()));
  }
  next();
};
