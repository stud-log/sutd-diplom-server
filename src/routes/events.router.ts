import { Achievement } from "../models/achievements.model";
import { ApiError } from "../shared/error/ApiError";
import { IUserReq } from "../shared/interfaces/req";
import { Log } from "../models/logs.model";
import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import em from '../services/event-emmiter';

const eventsRouter = Router();

eventsRouter.get('/subscribe/:userId', (req, res, next) => {
  const myId = Number(req.params.userId);
  if(!myId || isNaN(myId)) return next(ApiError.badRequest('Credentials missing'));

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  em.subscribe('achievementReceived', (userId, data: Achievement) => {
    if(myId == userId) {
      res.write(`data: ${JSON.stringify({
        body: data,
        type: 'achievementReceived',
      })}\n\n`);
    }
  });

  em.subscribe('log', (userId, data: Log) => {
    if(myId == userId) {
      res.write(`data: ${JSON.stringify({
        body: data,
        type: 'log',
      })}\n\n`);
    }
  });
  
});

export { eventsRouter };