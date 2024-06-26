import { NextFunction, Request, Response } from "express";

import { ApiError } from "../shared/error/ApiError";
import { IUserReq } from "../shared/interfaces/req";
import fs from 'fs';
import scheduleService from "../services/schedule.service";

class ScheduleController {
  /**
   * Uses progress callbacks
   */
  regenerateGlobalCycledTimetable = async (req: Request, res: Response, next: NextFunction) => {
    if(!req.file){
      return ApiError.badFormData('File `table` is required');
    }
    try {
      const progressCallback = (progress: number, description: string) => {
        if(progress !== 100) res.write(JSON.stringify({ progress, description })); // Send progress to client
      };
  
      await scheduleService.regenerateGlobalCycledTimetable(req.file, progressCallback);
      res.end(JSON.stringify({ progress: 100, description: "Done" }));
      
    } catch (err) {
      return next(ApiError.internal(err as string));
    }
  };

  migrateGlobalCycledTimetableToCalendar = async (req: Request, res: Response, next: NextFunction) => {
    try {
      return await scheduleService
        .migrateGlobalCycledTimetableToCalendar(req.body.groupId)
        .then(post => res.json(post));
      
    } catch (err) {
      console.log(err);
      return next(ApiError.internal(err as string));
    }
  };

  regenerateGroupCycledTimetable = async (req: Request, res: Response, next: NextFunction) => {
    const { groupId } = req.params;
    const numGroupId = Number(groupId);
    if(!isNaN(numGroupId)){
      if((req as IUserReq).user.groupId == numGroupId) {
        return await scheduleService
          .regenerateGroupCycledTimetable(numGroupId, req.body)
          .then(resp => res.json(resp))
          .catch(err => next(ApiError.badRequest(err)));
      } else {
        return next(ApiError.badRequest('You don\'t have permission to change other schedules'));
      }
    }
    else {
      return next(ApiError.badRequest('Param is missing'));
    }

  };
  
  getSchedule = async (req: Request, res: Response, next: NextFunction) => {
    const { groupId } = req.params;
    const { wholeTable } = req.query;
    if(!isNaN(Number(groupId))){
      return await scheduleService
        .getSchedule(Number(groupId), (req as IUserReq).user.id, Boolean(wholeTable), )
        .then(resp => res.json(resp))
        .catch(err => {
          console.log(err);
          return next(ApiError.badRequest(err));
        });
    }
    else {
      return next(ApiError.badRequest('Param is missing'));
    }
   
  };
  
  getScheduleElement = async (req: Request, res: Response, next: NextFunction) => {
    const { recordId } = req.params;
    
    if(!isNaN(Number(recordId))){
      return await scheduleService
        .getScheduleElement(Number(recordId))
        .then(resp => res.json(resp))
        .catch(err => {
          console.log(err);
          return next(ApiError.badRequest(err));
        });
    }
    else {
      return next(ApiError.badRequest('Param is missing'));
    }
    
  };
  
  getGroupTimetable = async (req: Request, res: Response, next: NextFunction) => {
    const { groupId } = req.params;
    if(!isNaN(Number(groupId))){
      return await scheduleService
        .getGroupTimetable(Number(groupId))
        .then(resp => res.json(resp))
        .catch(err => {
          console.log(err);
          return next(ApiError.badRequest(err));
        });
    }
    else {
      return next(ApiError.badRequest('Param is missing'));
    }
   
  };

  updateOrCreateCustomActivity = async (req: Request, res: Response, next: NextFunction) => {
    
    return await scheduleService
      .updateOrCreateCustomActivity(req)
      .then(resp => res.json(resp))
      .catch(err => next(ApiError.badFormData(err)));
    
  };
}

export default new ScheduleController();