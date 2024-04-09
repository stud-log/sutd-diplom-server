import { Router } from 'express';
import { uploadFile } from '../middleware/upload-file.middleware';
import uploadsController from '../controllers/uploads.controller';

const uploadsRouter = Router();

uploadsRouter.post('/ckeditor', uploadFile('upload', 'ckeditor'), uploadsController.uploadCKEDITOR);

export { uploadsRouter };
