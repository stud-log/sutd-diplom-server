import { Router } from "express";
import groupController from "../controllers/group.controller";

const groupRouter = Router();

groupRouter.get('', groupController.getAll);

export { groupRouter };