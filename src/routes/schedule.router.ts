import { Router } from "express";
import { checkUploadPath } from "../middleware/check-upload-path.middleware";
import scheduleController from "../controllers/schedule.controller";
import { uploadFile } from "../middleware/upload-file.middleware";

const scheduleRouter = Router();

/**
 * Uses for recreating all timetable for all groups
 * __NOTE__: Table must be without headers! Only rows!
 */
scheduleRouter.post('/regenerateGlobalCycledTimetable', checkUploadPath('timetables'), uploadFile('table'), scheduleController.regenerateGlobalCycledTimetable);

export { scheduleRouter };