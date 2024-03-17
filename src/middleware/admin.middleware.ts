import { Admin, AdminLevels } from '../models/admin.model';
import { NextFunction, Request, Response } from 'express';
import tokenService, { TokenPayload } from '../services/token.service';

import { ApiError } from '../shared/error/ApiError';
import { IUserReq } from '../shared/interfaces/req';

export const adminMiddleware =
  (accessLevel?: AdminLevels) => async (req: Request, res: Response, next: NextFunction) => {
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
      const checkAdmin = await Admin.findOne({ where: { id: userData.id } });

      if (checkAdmin) {
        if (accessLevel) {
          if (Number(checkAdmin.accessLevel) > Number(accessLevel)) {
            return next(ApiError.forbidden('Ващ уровень доступа не подходит для совершения данной операции'));
          }
        }
        (req as IUserReq).user = userData;
        (req as IUserReq).isAdmin = true;
        return next();
      } else {
        return next(ApiError.forbidden('У вас недостаточно прав'));
      }
    } catch (e) {
      //сюда мы попадаем, если есть проблемы с токеном
      //предполагаемая причина - истек срок дейсвтия | нет токена
      console.log(e);
      return next(ApiError.unauthorizedError());
    }
  };
