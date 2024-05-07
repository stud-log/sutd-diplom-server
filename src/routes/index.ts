import { Router } from 'express';
import { achievementRouter } from './achievement.router';
import { adminRouter } from './admin.router';
import { groupRouter } from './group.router';
import { recordRouter } from './record.router';
import { scheduleRouter } from './schedule.router';
import { subjectRouter } from './subject.router';
import { uploadsRouter } from './uploads.router';
import { userRouter } from './user.router';

const router = Router();

router.use('/groups', groupRouter);
router.use('/users', userRouter);
router.use('/schedule', scheduleRouter);
router.use('/subjects', subjectRouter);
router.use('/admin', adminRouter);
router.use('/record', recordRouter);
router.use('/uploads', uploadsRouter);
router.use('/achievements', achievementRouter);

export { router };
