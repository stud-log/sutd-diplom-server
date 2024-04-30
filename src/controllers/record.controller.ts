import { NextFunction, Request, Response } from "express";

import { ApiError } from "../shared/error/ApiError";
import { IUserReq } from "../shared/interfaces/req";
import recordService from "../services/records.service";
import taskService from "../services/task.service";

class RecordController {
  
  getEntity = async (req: Request, res: Response, next: NextFunction) => {
    const { recordTable, recordId } = req.params;
    if(recordId && recordTable) {
      if(!isNaN(Number(recordId))){
        return await recordService
          .getEntity(recordTable, Number(recordId), (req as IUserReq).user.id, (req as IUserReq).user.groupId)
          .then(post => res.json(post))
          .catch(err => {
            return next(ApiError.badRequest(err));
          });
      }
      else {
        return next(ApiError.badRequest('Params invalid'));
      }
    }
    
    return next(ApiError.badRequest('Params missing'));
   
  };

  getEntityUserTasks = async (req: Request, res: Response, next: NextFunction) => {
    const { recordTable, recordId } = req.params;
    if(recordId && recordTable) {
      if(!isNaN(Number(recordId))){
        return await recordService
          .getEntityUserTasks(recordTable, Number(recordId), (req as IUserReq).user.id, (req as IUserReq).user.groupId)
          .then(post => res.json(post))
          .catch(err => {
            return next(ApiError.badRequest(err));
          });
      }
      else {
        return next(ApiError.badRequest('Params invalid'));
      }
    }
    
    return next(ApiError.badRequest('Params missing'));
   
  };

  getAllEntities = async (req: Request, res: Response, next: NextFunction) => {
    const { recordTable } = req.params;
    const { page, limit } = req.query;
    if(recordTable && !!page && !!limit) {
      return await recordService
        .getAllEntities(
          recordTable,
          Number(page),
          Number(limit),
          (req as IUserReq).user.id,
          (req as IUserReq).user.groupId,
          Number(req.query.subjectId),
          req.query.label as string,
          req.query.favorites as string,
        )
        .then(post => res.json(post))
        .catch(err => {
          console.log(err);
          return next(ApiError.badRequest(err));
        });
    }
    
    return next(ApiError.badRequest('Params missing'));
   
  };

  createOrUpdatePost = async (req: Request, res: Response, next: NextFunction) => {
    const { recordTable, recordId } = req.params;
    if(recordId && recordTable) {
      if(!isNaN(Number(recordId))){
        return await recordService
          .createOrUpdatePost(recordTable, Number(recordId), req)
          .then(post => res.json(post))
          .catch(err => next(ApiError.badRequest(err)));
      }
      else {
        return next(ApiError.badRequest('Params invalid'));
      }
    }
    
    return next(ApiError.badRequest('Params missing'));
   
  };

  react = async (req: Request, res: Response, next: NextFunction) => {
    const { recordId } = req.body;
    if(recordId) {
      if(!isNaN(Number(recordId))){
        return await recordService
          .react(req.body, (req as IUserReq).user.id)
          .then(post => res.json(post))
          .catch(err => {
            return next(ApiError.badRequest(err));
          });
      }
      else {
        return next(ApiError.badRequest('Params invalid'));
      }
    }
    
    return next(ApiError.badRequest('Params missing'));
   
  };

  favorite = async (req: Request, res: Response, next: NextFunction) => {
    const { recordId } = req.body;
    if(recordId) {
      if(!isNaN(Number(recordId))){
        return await recordService
          .favorite(req.body, (req as IUserReq).user.id)
          .then(post => res.json(post))
          .catch(err => {
            return next(ApiError.badRequest(err));
          });
      }
      else {
        return next(ApiError.badRequest('Params invalid'));
      }
    }
    
    return next(ApiError.badRequest('Params missing'));
   
  };

  comment = async (req: Request, res: Response, next: NextFunction) => {
    const { recordId } = req.body;
    if(recordId) {
      if(!isNaN(Number(recordId))){
        return await recordService
          .comment(req, (req as IUserReq).user.id, (req as IUserReq).user.groupId)
          .then(post => res.json(post))
          .catch(err => {
            return next(ApiError.badRequest(err));
          });
      }
      else {
        return next(ApiError.badRequest('Params invalid'));
      }
    }
    
    return next(ApiError.badRequest('Params missing'));
   
  };

  view = async (req: Request, res: Response, next: NextFunction) => {
    const { recordId } = req.body;
    if(recordId) {
      if(!isNaN(Number(recordId))){
        return await recordService
          .view(Number(recordId), (req as IUserReq).user.id)
          .then(post => res.json(post))
          .catch(err => {
            return next(ApiError.badRequest(err));
          });
      }
      else {
        return next(ApiError.badRequest('Params invalid'));
      }
    }
    
    return next(ApiError.badRequest('Params missing'));
   
  };

  changeHomeworkStatus = async (req: Request, res: Response, next: NextFunction) => {
    const { recordId } = req.body;
    if(recordId) {
      if(!isNaN(Number(recordId))){
        return await taskService
          .changeHomeworkStatus(req.body, (req as IUserReq).user.id)
          .then(post => res.json(post))
          .catch(err => {
            return next(ApiError.badRequest(err));
          });
      }
      else {
        return next(ApiError.badRequest('Params invalid'));
      }
    }
    
    return next(ApiError.badRequest('Params missing'));
   
  };

}

export default new RecordController();