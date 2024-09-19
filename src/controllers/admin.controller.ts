import { NextFunction, Request, Response } from "express";

import { ApiError } from "../shared/error/ApiError";
import setupService from "../services/setup.service";
import adminService from "../services/admin/admin.service";

class AdminController {
  /**
   * Uses progress callbacks
   */
  setup = async (req: Request, res: Response, next: NextFunction) => {
    if(!req.file){
      return ApiError.badFormData('File `table` is required');
    }
    try {
      const progressCallback = (progress: number, description: string) => {
        if(progress !== 100) {
          // TODO: resolve this problem
          // res.write(JSON.stringify({ progress, description }));
        } // Send progress to client
      };
  
      await setupService.setup(req.file, progressCallback);
      res.end(JSON.stringify({ progress: 100, description: "Done" }));
      
    } catch (err) {
      return next(ApiError.internal(err as string));
    }
  };

  // users

  getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    return await adminService.userService
      .getUsers(
        Number(req.query.page),
        Number(req.query.limit),
        req.query.roleIds as string,
        req.query.groupIds as string,
        req.query.searchByFio as string,
        req.query.sortmodel as string
      )
      .then(resp => res.json(resp))
      .catch(err => next(ApiError.badFormData(err)));
  };
}

export default new AdminController();