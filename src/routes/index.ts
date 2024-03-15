import { Router } from 'express';
import { groupRouter } from './group.router';
import { userRouter } from './user.router';

const router = Router();

router.use('/groups', groupRouter);
router.use('/users', userRouter);

export { router };
