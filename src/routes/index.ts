import { Router } from 'express';
import { adminRouter } from './admin.router';
import { groupRouter } from './group.router';
import { scheduleRouter } from './schedule.router';
import { userRouter } from './user.router';

const router = Router();

router.use('/groups', groupRouter);
router.use('/users', userRouter);
router.use('/schedule', scheduleRouter);
router.use('/admin', adminRouter);

export { router };
