import { NextFunction, Request, Response } from 'express';

import { ApiError } from '../shared/error/ApiError';
import uploadsService from '../services/uploads.service';

class UploadsController {
  //special for ckeditor
  uploadCKEDITOR = async (req: Request, res: Response, next: NextFunction) => {
    if(!req.file){
      return ApiError.badFormData('File was not uploaded');
    }
    return await uploadsService
      .uploadCKEDITOR(req.file)
      .then(resp => res.status(200).json(resp))
      .catch(err => next(ApiError.badFormData(err)));
  };
}

export default new UploadsController();
