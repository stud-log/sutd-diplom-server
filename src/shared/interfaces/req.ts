import { Request } from 'express';
import { TokenPayload } from "../../services/token.service";

export interface IUserReq extends Request {
  user: TokenPayload;
  isAdmin?: boolean;
}