import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { checkUploadPath } from "../middleware/check-upload-path.middleware";
import recordController from "../controllers/record.controller";
import { uploadFiles } from "../middleware/upload-many-files.middleware";

const recordRouter = Router();

recordRouter.get('/post/:recordTable/:recordId', authMiddleware(), recordController.getEntity);
recordRouter.get('/post/:recordTable/:recordId/userTasks', authMiddleware(), recordController.getEntityUserTasks);
recordRouter.get('/posts/:recordTable', authMiddleware(), recordController.getAllEntities);

recordRouter.post('/post/:recordTable/:recordId', authMiddleware({ canEdit: true }), checkUploadPath('posts'), uploadFiles([ 'files', 'cover' ], 'posts', 20), recordController.createOrUpdatePost);
recordRouter.post('/post/Homework-changeStatus', authMiddleware(), recordController.changeHomeworkStatus);
recordRouter.post('/post/react', authMiddleware(), recordController.react);
recordRouter.post('/post/favorite', authMiddleware(), recordController.favorite);
recordRouter.post('/post/comment', authMiddleware(), checkUploadPath('posts'), uploadFiles([ 'files' ], 'posts', 20), recordController.comment);
recordRouter.post('/post/view', authMiddleware(), recordController.view);

export { recordRouter };