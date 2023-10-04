import { NextFunction, Request, Response } from 'express';
import { ThreeService } from '../services/three.service';

class ThreeController {
  private threeService: ThreeService = new ThreeService();

  calculate = async (req: Request, res: Response, next: NextFunction) => {
    return await this.threeService
      .calculate(req.body)
      .then(resp => res.json(resp))
      .catch(err => res.status(err.status).json({ message: err.message || 'Please, try again' }));
  };

  
}

export default new ThreeController();
