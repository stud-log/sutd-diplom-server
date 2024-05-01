import { body, param } from "express-validator";

import { Router } from "express";
import { adminMiddleware } from "../middleware/admin.middleware";
import { authMiddleware } from "../middleware/auth.middleware";
import userController from "../controllers/user.controller";
import { validateRequestMiddleware } from "../middleware/validate-request.middleware";

const userRouter = Router();

userRouter.get('', adminMiddleware(), userController.getAll);
userRouter.get('/refresh', userController.refresh);
userRouter.get('/me', authMiddleware(), userController.getMe);
userRouter.get('/checkGuide', authMiddleware(), userController.isGuideSeen);
userRouter.get('/myTasks', authMiddleware(), userController.myTasks);
userRouter.get('/getTask', authMiddleware(), userController.getTask);

userRouter.get(
  '/:id',
  param('id').exists({ checkFalsy: true }),
  validateRequestMiddleware,
  adminMiddleware(),
  userController.getOne
);

userRouter.post(
  '/reg',
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('lastName').exists({ checkFalsy: true }),
  body('patronymic'),
  body('groupId').exists({ checkFalsy: true }),
  body('phone').exists({ checkFalsy: true }),
  body('role'),
  validateRequestMiddleware,
  userController.registration
);
userRouter.post(
  '/login',
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  validateRequestMiddleware,
  userController.login
);
userRouter.post('/logout', userController.logout);

userRouter.post(
  '/recovery',
  body('email').exists({ checkFalsy: true }),
  validateRequestMiddleware,
  userController.passRecovery,
);

userRouter.post(
  '/recovery/update',
  body('recoveryId').exists({ checkFalsy: true }),
  body('userId').exists({ checkFalsy: true }),
  body('hash').exists({ checkFalsy: true }),
  validateRequestMiddleware,
  userController.passRecoveryUpdate,
);

userRouter.post('/update', authMiddleware(), userController.update);
userRouter.post('/manage', authMiddleware({ canInvite: true }), userController.manageAccount);
userRouter.post('/seenGuideline', authMiddleware(), userController.seenGuideLine);

export { userRouter };