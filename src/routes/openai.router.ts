import { Router } from "express";
import openaiController from "../controllers/openai.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const openaiRouter = Router();

openaiRouter.post('/prompt', authMiddleware(), openaiController.prompt);

export { openaiRouter };