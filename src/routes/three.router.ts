import { Router } from 'express';
import threeController from '../controllers/three.controller';

const threeRouter = Router();

threeRouter.post('/calculate', threeController.calculate)

export { threeRouter  };
