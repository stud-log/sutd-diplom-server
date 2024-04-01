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
}

export default new ScheduleController();