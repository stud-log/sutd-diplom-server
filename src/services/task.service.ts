import { UserTask, UserTaskStatus } from "../models/user-tasks.model";

import { AppFiles } from "../models/files.model";
import { IUserReq } from "../shared/interfaces/req";
import { Record } from "../models/records.model";
import { Request } from "express";
import { extractPathFromUrl } from "../shared/utils/fixPathFiles";
import fs from 'fs';
import path from "path";

class TaskService {

  async changeStatus ( dto: {taskId?: string; recordId: number; status: UserTaskStatus}, userId: number, groupId: number) {
    try {
      const existedTask = await UserTask.findOne({ where: {
        ...(dto.taskId && dto.taskId != '-1' && !isNaN(Number(dto.taskId)) ? { id: Number(dto.taskId) } : { recordId: dto.recordId, }),
        userId
      } });
      if(!existedTask) {
        return await UserTask.create({
          recordId: dto.recordId,
          userId,
          groupId,
          status: UserTaskStatus.inProgress,
        });
      }
      existedTask.status = dto.status;
      return await existedTask.save();
    }
    catch (err) {
      console.log(err);
      throw 'Не удалось изменить статус домашки';
    }
  }

  async updateOrCreateNotification(req: Request) {
    /**
     *  parentId: -1, // if we want make task dependent. -1 for independent
        recordId: -1, // if we want to create task pinned to some record entity (team, for example). -1 is for independent
        taskId: recordId, // id of this entity
     */
    try {
      const dto = req.body as {
        title: string;
        description: string;
        recordId: string;
        startDate: string;
        endDate: string;
        taskId: string;
        parentId: string;
        filesToDelete: string; // stringified array of numbers
      };
      const files = req.files as unknown as { [fieldname: string]: Express.Multer.File[] }; // as {files: File[], cover: File[] but one}
      const author = (req as IUserReq).user;

      const record = await Record.findOne({ where: { recordTable: 'UserTask', recordId: dto.taskId } });
      if(record) {
        // Means that we are updating
      
        const task = await UserTask.findByPk(dto.taskId);
        if(!task) throw 'Задача не найдена';
        task.title = dto.title;
        task.description = dto.description;
        task.startDate = dto.startDate;
        task.endDate = dto.endDate;

        if(dto.parentId && dto.parentId !== '-1' && isNaN(Number(dto.parentId))) {
          task.parentId = Number(dto.parentId);
        }

        if(dto.recordId && dto.recordId !== '-1' && isNaN(Number(dto.recordId))) {
          task.recordId = Number(dto.recordId);
        }

        await task.save();
        
        //TODO: move to special function
        const parsedFilesToDelete = JSON.parse(dto.filesToDelete) as number[];
        if(parsedFilesToDelete && parsedFilesToDelete.length > 0) {
          const filesToDelete = await AppFiles.findAll({ where: { id: parsedFilesToDelete } });
          filesToDelete.forEach(file => {
            const filePath = path.resolve(__dirname, '..', 'static', file.url.replace('\\', '')); //replace first '\' to avoid path resolving it from root
            fs.unlink(filePath, console.log);
            file.destroy();
          });
        }

        if(files && files['files'] && files['files'].length > 0) {
          await AppFiles.bulkCreate(files['files'].map(file => {
            return ({
              recordId: record.id,
              fileName: file.originalname,
              fileSize: file.size,
              url: '/' + extractPathFromUrl(file.path)
            });}));
        }

        return true;
      
      }
      else {
      // Means that we are creating
        
        const post = await UserTask.create({
          userId: author.id,
          groupId: author.groupId,
          title: dto.title,
          description: dto.description,
          startDate: dto.startDate,
          endDate: dto.endDate,
          status: UserTaskStatus.inProgress,
          ...(dto.parentId && dto.parentId !== '-1' && isNaN(Number(dto.parentId)) ? { parentId: Number(dto.parentId) } : {}),
          ...(dto.recordId && dto.recordId !== '-1' && isNaN(Number(dto.recordId)) ? { recordId: Number(dto.recordId) } : {}),
        });

        if(!post) throw 'Задача не создана';
      
        const _record = await Record.findOne({ where: { recordTable: 'UserTask', recordId: post.id } });
        if(_record && files && files['files'] && files['files'].length > 0) {
          await AppFiles.bulkCreate(files['files'].map(file => ({
            recordId: _record.id,
            fileName: file.originalname,
            fileSize: file.size,
            url: '/' + extractPathFromUrl(file.path)
          })));
        }

        return true;
      }
    }
    catch (e) {
      console.log(e);
      if(typeof e == 'string') {
        throw e;
      }
      throw 'Непредвиденная ошибка';
    }

  }

}

export default new TaskService();