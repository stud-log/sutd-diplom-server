import { NextFunction, Request, Response } from "express";

import { ApiError } from "../shared/error/ApiError";
import { IUserReq } from "../shared/interfaces/req";
import groupService from "../services/group.service";

class GroupController {
  
  getAll = async (req: Request, res: Response, next: NextFunction) => {
    return await groupService
      .getAll()
      .then(post => res.json(post))
      .catch(err => next(ApiError.badRequest(err)));
  };

  groupUsers = async (req: Request, res: Response, next: NextFunction) => {
    return await groupService
      .groupUsers((req as IUserReq).user.groupId)
      .then(post => res.json(post))
      .catch(err => next(ApiError.badRequest(err)));
  };

}

export default new GroupController();