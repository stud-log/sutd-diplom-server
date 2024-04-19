import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { checkUploadPath } from "../middleware/check-upload-path.middleware";
import scheduleController from "../controllers/schedule.controller";
import { uploadFile } from "../middleware/upload-file.middleware";

const scheduleRouter = Router();

scheduleRouter.get('/:groupId', scheduleController.getSchedule);
scheduleRouter.get('/one/:recordId', scheduleController.getScheduleElement);

/**
 * Uses for recreating all timetable for all groups
 * __NOTE__: Table must be without headers! Only rows!
 */
scheduleRouter.post('/regenerateGlobalCycledTimetable', checkUploadPath('timetables'), uploadFile('table'), scheduleController.regenerateGlobalCycledTimetable);

scheduleRouter.post('/migrateGlobalCycledTimetableToCalendar', scheduleController.migrateGlobalCycledTimetableToCalendar);

export { scheduleRouter };