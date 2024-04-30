import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import groupController from "../controllers/group.controller";

const groupRouter = Router();

groupRouter.get('', groupController.getAll);
groupRouter.get('/users', authMiddleware({ canInvite: true }), groupController.groupUsers);

export { groupRouter };