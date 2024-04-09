import { NextFunction, Request, Response } from "express";

import { ApiError } from "../shared/error/ApiError";
import subjectsService from "../services/subjects.service";

class SubjectController {
  
  getAll = async (req: Request, res: Response, next: NextFunction) => {
    return await subjectsService
      .getAll()
      .then(post => res.json(post))
      .catch(err => next(ApiError.badRequest(err)));
  };

  getByGroup = async (req: Request, res: Response, next: NextFunction) => {
    const groupId = req.query.groupId;
    if(groupId) {
      return await subjectsService
        .getByGroup(groupId as string)
        .then(post => res.json(post))
        .catch(err => next(ApiError.badRequest(err)));
    }
    else {
      next(ApiError.badRequest('Group id is required'));
    }
  };

}

export default new SubjectController();