import { NextFunction, Request, Response } from "express";

import { ApiError } from "../shared/error/ApiError";
import setupService from "../services/setup.service";
import openaiService from "../services/openai.service";
import { IUserReq } from "../shared/interfaces/req";

class OpenaiController {
  
  prompt = async (req: Request, res: Response, next: NextFunction) => {
    return await openaiService
      .prompt(req.body.prompt, (req as IUserReq).user)
      .then(post => res.json(post))
      .catch(err => next(ApiError.badRequest(err)));
  };
}

export default new OpenaiController();