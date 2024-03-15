import { NextFunction, Request, Response } from "express";

import { ApiError } from "../shared/error/ApiError";
import { GroupService } from "../services/group.service";
import { UserService } from "../services/user.service";

class UserController {
  private userService = new UserService();
  
  getAll = async (req: Request, res: Response, next: NextFunction) => {
    return await this.userService
      .getAll()
      .then(post => res.json(post))
      .catch(err => next(ApiError.badRequest(err)));
  };

  getOne = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    return await this.userService
      .getOne(Number(id))
      .then(post => res.json(post))
      .catch(err => next(ApiError.badRequest(err)));
  };

  async registration(req: Request, res: Response, next: NextFunction) {
    try {
      const userData = await this.userService.registration(req.body);
      res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
      return res.json(userData);
    } catch (e) {
      next(e);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const userData = await this.userService.login(req.body);
      res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
      return res.json(userData);
    } catch (e) {
      next(e);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.cookies;
      const token = await this.userService.logout(refreshToken);
      res.clearCookie('refreshToken');
      return res.json(token);
    } catch (e) {
      next(e);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.cookies;
      const userData = await this.userService.refresh(refreshToken);
      res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
      return res.json(userData);
    } catch (e) {
      next(e);
    }
  }

}

export default new UserController();