import { NextFunction, Request, Response } from "express";

import { ApiError } from "../shared/error/ApiError";
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

  getSchedule = async (req: Request, res: Response, next: NextFunction) => {
    const { groupId } = req.params;
    const { wholeTable } = req.query;
    if(!isNaN(Number(groupId))){
      return await scheduleService
        .getSchedule(Number(groupId), Boolean(wholeTable))
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
}

export default new ScheduleController();