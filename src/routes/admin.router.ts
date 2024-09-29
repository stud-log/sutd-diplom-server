import { Router } from "express";
import adminController from "../controllers/admin.controller";
import { checkUploadPath } from "../middleware/check-upload-path.middleware";
import { uploadFile } from "../middleware/upload-file.middleware";
import { param, query } from "express-validator";
import { validateRequestMiddleware } from "../middleware/validate-request.middleware";

const adminRouter = Router();

/**
 * Setup app. Create all groups, subjects and timetables
 * __NOTE__: Table must be without headers! Only rows!
 */
adminRouter.post('/setup', checkUploadPath('timetables'), uploadFile('table', 'timetables'), adminController.setup);

//users
adminRouter.get('/users',
  query([ 'page', 'limit' ]).exists({ values: 'falsy' }),
  validateRequestMiddleware,
  adminController.getAllUsers
);
adminRouter.delete('/users/:userId',
  param('id').exists({ checkFalsy: true }),
  validateRequestMiddleware,
  adminController.removeUser
);

export { adminRouter };