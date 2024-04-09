import { Router } from "express";
import subjectController from "../controllers/subject.controller";

const subjectRouter = Router();

subjectRouter.get('', subjectController.getAll);
/** param: {groupId} */
subjectRouter.get('/byGroup', subjectController.getByGroup);

export { subjectRouter };