import { NextFunction, Request, Response } from "express";

import { ApiError } from "../shared/error/ApiError";
import { IUserReq } from "../shared/interfaces/req";
import recordService from "../services/records.service";

class RecordController {
  
  getPost = async (req: Request, res: Response, next: NextFunction) => {
    const { recordTable, recordId } = req.params;
    if(recordId && recordTable) {
      if(!isNaN(Number(recordId)))
        return await recordService
          .getPost(recordTable, Number(recordId), (req as IUserReq).user.id, (req as IUserReq).user.groupId)
          .then(post => res.json(post))
          .catch(err => next(ApiError.badRequest(err)));
    }
    
    return next(ApiError.badRequest('Params missing'));
   
  };

  getAllPosts = async (req: Request, res: Response, next: NextFunction) => {
    const { recordTable } = req.params;
    const { page, limit } = req.query;
    if(recordTable && !!page && !!limit) {
      return await recordService
        .getAllPosts(recordTable, Number(page), Number(limit), (req as IUserReq).user.id, (req as IUserReq).user.groupId)
        .then(post => res.json(post))
        .catch(err => next(ApiError.badRequest(err)));
    }
    
    return next(ApiError.badRequest('Params missing'));
   
  };

  createOrUpdatePost = async (req: Request, res: Response, next: NextFunction) => {
    const { recordTable, recordId } = req.params;
    if(recordId && recordTable) {
      if(!isNaN(Number(recordId)))
        return await recordService
          .createOrUpdatePost(recordTable, Number(recordId), req)
          .then(post => res.json(post))
          .catch(err => next(ApiError.badRequest(err)));
    }
    
    return next(ApiError.badRequest('Params missing'));
   
  };

}

export default new RecordController();