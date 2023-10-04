import { Router } from 'express';
import { threeRouter } from './three.router';

const router = Router();

router.use('/three', threeRouter);

export { router };
