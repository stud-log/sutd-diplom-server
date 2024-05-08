import { NextFunction, Request, Response } from "express";

import { ApiError } from "../shared/error/ApiError";
import { IUserReq } from "../shared/interfaces/req";
import achievementService from "../services/achievement.service";
import logService from "../services/log.service";
import notificationService from "../services/notification.service";
import userService from "../services/user.service";

class UserController {
  
  getMe = async (req: Request, res: Response, next: NextFunction) => {
    return await userService
      .getMe((req as IUserReq).user.id)
      .then(post => res.json(post))
      .catch(err => next(ApiError.badRequest(err)));
  };

  myTasks = async (req: Request, res: Response, next: NextFunction) => {
    return await userService
      .myTasks((req as IUserReq).user.id)
      .then(post => res.json(post))
      .catch(err => next(ApiError.badRequest(err)));
  };

  getTask = async (req: Request, res: Response, next: NextFunction) => {
    const taskId = Number(req.query.taskId);
    if(taskId && !isNaN(taskId)){
      return await userService
        .getTask(taskId)
        .then(post => res.json(post))
        .catch(err => next(ApiError.badRequest(err)));
    }
    else {
      return next(ApiError.badRequest('Missing param'));
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    return await userService
      .getAll()
      .then(post => res.json(post))
      .catch(err => next(ApiError.badRequest(err)));
  };

  getOne = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    return await userService
      .getOne(Number(id))
      .then(post => res.json(post))
      .catch(err => next(ApiError.badRequest(err)));
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    return await userService
      .update(req.body, (req as IUserReq).user.id)
      .then(post => res.json(post))
      .catch(err => next(ApiError.badRequest(err)));
  };

  async registration(req: Request, res: Response, next: NextFunction) {
    try {
      const userData = await userService.registration(req.body);
      res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
      return res.json(userData);
    } catch (e) {
      console.log(e);
      next(ApiError.badRequest(e as string));
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const userData = await userService.login(req.body);
      res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
      logService.userEnter(userData.user.id, req.app.get('io'));
      return res.json(userData);
    } catch (e) {
      console.log(e);
      next(ApiError.badRequest(e as string));
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.cookies;
      const token = await userService.logout(refreshToken);
      res.clearCookie('refreshToken');
      return res.json(token);
    } catch (e) {
      console.log(e);
      next(ApiError.badRequest(e as string));
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.cookies;
      const userData = await userService.refresh(refreshToken);
      res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
      logService.userEnter(userData.user.id, req.app.get('io'));
      
      return res.json(userData);
    } catch (e) {
      console.log(e);
      next(e);
    }
  }

  passRecovery = async (req: Request, res: Response, next: NextFunction) => {
    return await userService
      .passRecovery(req.body)
      .then(resp => res.json(resp))
      .catch(err => next(ApiError.badFormData(err)));
  };

  passRecoveryUpdate = async (req: Request, res: Response, next: NextFunction) => {
    return await userService
      .passRecoveryUpdate(req.body)
      .then(resp => res.json(resp))
      .catch(err => next(ApiError.badFormData(err)));
  };

  manageAccount = async (req: Request, res: Response, next: NextFunction) => {
    
    return await userService
      .manageAccount(req.body)
      .then(resp => res.json(resp))
      .catch(err => next(ApiError.badFormData(err)));
    
  };

  isGuideSeen = async (req: Request, res: Response, next: NextFunction) => {
    
    return await logService
      .isGuideSeen((req as IUserReq).user.id)
      .then(resp => res.json(resp))
      .catch(err => next(ApiError.badFormData(err)));
    
  };

  seenGuideLine = async (req: Request, res: Response, next: NextFunction) => {
    
    return await userService
      .seenGuideLine((req as IUserReq).user.id)
      .then(resp => {
        // исключение. ачивки должны проверятся из logService
        achievementService.checkForAchievementByEntrance((req as IUserReq).user.id, req.app.get('io'));
        return res.json(resp);
      })
      .catch(err => next(ApiError.badFormData(err)));
    
  };

  notifications = async (req: Request, res: Response, next: NextFunction) => {
    
    return await notificationService
      .getUserNotifications((req as IUserReq).user.id)
      .then(resp => res.json(resp))
      .catch(err => next(ApiError.badFormData(err)));
    
  };

  checkUnSeen = async (req: Request, res: Response, next: NextFunction) => {
    
    return await notificationService
      .checkUnSeen((req as IUserReq).user.id)
      .then(resp => res.json(resp))
      .catch(err => next(ApiError.badFormData(err)));
    
  };

  markAsSeen = async (req: Request, res: Response, next: NextFunction) => {
    
    return await notificationService
      .markAsSeen((req as IUserReq).user.id, req.query.noteId as string)
      .then(resp => res.json(resp))
      .catch(err => next(ApiError.badFormData(err)));
    
  };

}

export default new UserController();