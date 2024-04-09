import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { checkUploadPath } from "../middleware/check-upload-path.middleware";
import recordController from "../controllers/record.controller";
import { uploadFiles } from "../middleware/upload-many-files.middleware";

const recordRouter = Router();

recordRouter.get('/post/:recordTable/:recordId', authMiddleware(), recordController.getPost);
recordRouter.get('/posts/:recordTable', authMiddleware(), recordController.getAllPosts);

recordRouter.post('/post/:recordTable/:recordId', authMiddleware({ canEdit: true }), checkUploadPath('posts'), uploadFiles([ 'files', 'cover' ], 'posts', 20), recordController.createOrUpdatePost);

export { recordRouter };