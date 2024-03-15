import { body, param } from "express-validator";

import { Router } from "express";
import userController from "../controllers/user.controller";
import { validateRequestMiddleware } from "../middleware/validate-request.middleware";

const userRouter = Router();

userRouter.get('', userController.getAll);
userRouter.get(
  '/:id',
  param('id').exists({ checkFalsy: true }),
  validateRequestMiddleware,
  userController.getOne
);
userRouter.get('/refresh', userController.refresh);

userRouter.post(
  '/registration',
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('lastName').exists({ checkFalsy: true }),
  body('patronymic').exists({ checkFalsy: false }),
  body('group').exists({ checkFalsy: true }),
  body('phone').exists({ checkFalsy: true }),
  body('role').exists({ checkFalsy: false }),
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

export { userRouter };