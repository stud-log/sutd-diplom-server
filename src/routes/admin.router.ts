import { Router } from "express";
import adminController from "../controllers/admin.controller";
import { checkUploadPath } from "../middleware/check-upload-path.middleware";
import { uploadFile } from "../middleware/upload-file.middleware";

const adminRouter = Router();

/**
 * Setup app. Create all groups, subjects and timetables
 * __NOTE__: Table must be without headers! Only rows!
 */
// TODO: Add admin middleware
adminRouter.post('/setup', checkUploadPath('timetables'), uploadFile('table', 'timetables'), adminController.setup);

//users
adminRouter.post('/users', adminController.setup);

export { adminRouter };