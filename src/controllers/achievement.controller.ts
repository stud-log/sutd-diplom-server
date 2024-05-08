import { NextFunction, Request, Response } from "express";

import { ApiError } from "../shared/error/ApiError";
import { IUserReq } from "../shared/interfaces/req";
import achievementService from "../services/achievement.service";

class AchievementController {
  
  all = async (req: Request, res: Response, next: NextFunction) => {
    return await achievementService
      .all()
      .then(post => res.json(post))
      .catch(err => next(ApiError.badRequest(err)));
  };

  allWithProgress = async (req: Request, res: Response, next: NextFunction) => {
    return await achievementService
      .allWithProgress((req as IUserReq).user.id)
      .then(post => res.json(post))
      .catch(err => next(ApiError.badRequest(err)));
  };

}

export default new AchievementController();