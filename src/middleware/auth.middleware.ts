import { NextFunction, Request, Response } from 'express';
import tokenService, { TokenPayload } from '../services/token.service';

import { ApiError } from '../shared/error/ApiError';
import { RoleCreationDTO } from '@stud-log/news-types/dto';
import { isEqual } from 'lodash';

interface IUserReq extends Request {
  user: TokenPayload;
  isAdmin?: boolean;
}

export const authMiddleware = (neededPermission?: RoleCreationDTO['permissions']) => (req: Request, res: Response, next: NextFunction) => {
  if (req.method === 'OPTIONS') {
    return next();
  }
  try {
    const token = req.headers.authorization?.split(' ')[1]; // Bearer {token}

    if (!token) {
      return next(ApiError.unauthorizedError());
    }
    const userData = tokenService.validateAccessToken(token);

    if (!userData) {
      return next(ApiError.unauthorizedError());
    }

    if (neededPermission) {
      if (!isEqual(userData.permissions, neededPermission) ) {
        return next(ApiError.forbidden('У вас нет требуемых разрешений'));
      }
    }

    (req as IUserReq).user = userData;

    return next();
  } catch (e) {
    //сюда мы попадаем, если есть проблемы с токеном
    //предполагаемая причина - истек срок дейсвтия | нет токена
    console.log(e);
    return next(ApiError.unauthorizedError());
  }
};
