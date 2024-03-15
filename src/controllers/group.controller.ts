import { NextFunction, Request, Response } from "express";

import { ApiError } from "../shared/error/ApiError";
import { GroupService } from "../services/group.service";

class GroupController {
  private groupService = new GroupService();
  
  getAll = async (req: Request, res: Response, next: NextFunction) => {
    return await this.groupService
      .getAll()
      .then(post => res.json(post))
      .catch(err => next(ApiError.badRequest(err)));
  };

}

export default new GroupController();