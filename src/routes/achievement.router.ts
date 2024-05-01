import { Router } from "express";
import achievementController from "../controllers/achievement.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const achievementRouter = Router();

achievementRouter.get('/all', authMiddleware({ canInvite: true }), achievementController.all);

export { achievementRouter };