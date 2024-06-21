import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { checkUploadPath } from "../middleware/check-upload-path.middleware";
import scheduleController from "../controllers/schedule.controller";
import { uploadFile } from "../middleware/upload-file.middleware";
import { uploadFiles } from "../middleware/upload-many-files.middleware";

const scheduleRouter = Router();

scheduleRouter.get('/:groupId', authMiddleware(), scheduleController.getSchedule);
scheduleRouter.get('/one/:recordId', scheduleController.getScheduleElement);
scheduleRouter.get('/timetable/:groupId', scheduleController.getGroupTimetable);

/**
 * Uses for recreating all timetable for all groups
 * __NOTE__: Table must be without headers! Only rows!
 */
scheduleRouter.post('/regenerateGlobalCycledTimetable', checkUploadPath('timetables'), uploadFile('table'), scheduleController.regenerateGlobalCycledTimetable);

scheduleRouter.post('/regenerateGroupCycledTimetable/:groupId', authMiddleware({ canEdit: true }), scheduleController.regenerateGroupCycledTimetable);

scheduleRouter.post('/migrateGlobalCycledTimetableToCalendar', scheduleController.migrateGlobalCycledTimetableToCalendar);

scheduleRouter.post('/custom-activities/updateOrCreate',authMiddleware(), checkUploadPath('customActivities'), uploadFiles([ 'files' ], 'tasks', 20), scheduleController.updateOrCreateCustomActivity);

export { scheduleRouter };