import { Homework, HomeworkType } from "../models/homeworks.model";

import { AppFiles } from "../models/files.model";
import { Calendar } from "../models/calendar.model";
import { IUserReq } from "../shared/interfaces/req";
import { News } from "../models/news.model";
import { Record } from "../models/records.model";
import { Request } from "express";
import { Subject } from "../models/subject.model";
import { Team } from "../models/teams.model";
import { Timetable } from "../models/timetable.model";
import { User } from "../models/user.model";
import { UserComment } from "../models/user-comments.model";
import { UserFavorite } from "../models/user-favorites.model";
import { UserReaction } from "../models/user-reactions.model";
import { UserSetting } from "../models/user-settings.model";
import { UserTask } from "../models/user-tasks.model";
import { UserTaskStatus } from './../models/user-tasks.model';
import { UserView } from "../models/user-views.model";
import em from './event-emmiter';
import fs from 'fs';
import path from 'path';
import { sequelize } from "../db";

class RecordService {

  async getEntity(recordTable: string, recordId: number, userId: number, groupId?: number) {
    try {
      const Entity =
    recordTable == 'News' ? News :
      recordTable == 'Homework' ? Homework :
        recordTable == 'Calendar' ? Calendar :
          Team;

      const record = await Record.findOne({
        where: { recordTable, recordId },
        attributes: {
          include: [
            [ sequelize.literal(`(
            SELECT COALESCE(
                json_agg(json_build_object(
                    'id', "UserReactions"."id",
                    'userId', "UserReactions"."userId",
                    'recordId', "UserReactions"."recordId",
                    'type', "UserReactions"."type",
                    'imageUrl', "UserReactions"."imageUrl"
                    -- Add more properties as needed
                )),
                '[]'::json
            ) AS user_reactions
            FROM 
                "UserReactions" 
            WHERE 
                "recordId" = "Record"."id" AND 
                "userId" = ${userId}
        )`),
            'meReacted' ],
            [ sequelize.literal(`(
            SELECT CASE 
              WHEN EXISTS (
                SELECT * FROM "UserFavorites" WHERE "recordId" = "Record"."id" AND "userId" = ${userId}
              ) THEN TRUE 
              ELSE FALSE 
            END
          )`),
            'meFavorited' ],
            [ sequelize.literal(`(
            SELECT COALESCE(
                json_agg(json_build_object(
                    'id', "UserTasks"."id",
                    'userId', "UserTasks"."userId",
                    'groupId', "UserTasks"."groupId",
                    'recordId', "UserTasks"."recordId",
                    'title', "UserTasks"."title",
                    'description', "UserTasks"."description",
                    'trackedTime', "UserTasks"."trackedTime",
                    'status', "UserTasks"."status",
                    'doneDate', "UserTasks"."doneDate"
                    -- Add more properties as needed
                )),
                '[]'::json
            ) AS user_tasks
            FROM 
                "UserTasks" 
            WHERE 
                "recordId" = "Record"."id" AND 
                "userId" = ${userId}
        )`),
            'meWorked' ]
          ]
        },
        include: [
          {
            model: Entity,
            ...(recordTable == 'Homework' ? { include: [
              Subject
            ] } : {})
          
          },
        
          {
            model: UserComment,
            required: false,
            include: [
              {
                model: Record,
                as: 'myRecord',
                include: [
                  {
                    model: UserReaction,
                    required: false
                  }
                ],
              },
              {
                model: User,
                include: [
                  {
                    model: UserSetting,
                    required: false
                  }
                ]
              },
              {
                model: UserComment,
                as: 'children',
                required: false,
                include: [
                  {
                    model: Record,
                    as: 'myRecord',
                   
                    include: [
                      {
                        model: UserReaction,
                        required: false
                      }
                    ],
                  },
                  {
                    model: User,
                    include: [
                      {
                        model: UserSetting,
                        required: false
                      }
                    ]
                  },
                ]
              }
            
            ]
          },
          {
            model: UserReaction,
            required: false
          },
          {
            model: AppFiles,
            required: false
          },
          {
            model: UserView,
            required: false
          },
          {
            model: UserFavorite,
            required: false
          },
          {
            model: UserTask,
            where: { userId },
            required: false
          }
        ]
      });

      if(!record) throw 'Record not found';

      return record;
    }
    catch(e) {
      console.log(e);
      throw e;
    }

  }

  async createOrUpdatePost(recordTable: string, recordId: number, req: Request) {
    try {
    
      const dto = req.body as {
        recordId: string;
        recordTable: 'News' | 'Homework';
        title: string;
        content: string;
        label: string;
        subjectId: string;
        type: string;
        startDate: string;
        endDate: string;
        filesToDelete: string; // stringified array of numbers
      };
      const files = req.files as unknown as { [fieldname: string]: Express.Multer.File[] }; // as {files: File[], cover: File[] but one}
      const author = (req as IUserReq).user;

      const record = await Record.findOne({ where: { recordTable, recordId } });
      if(record) {
      // Means that we are updating post
        let post: News | Homework | null = null;
        if(recordTable == 'News') {
          post = await News.findByPk(recordId);
          if(!post) throw 'Новость не найдена';
          post.title = dto.title;
          post.content = dto.content;
          post.label = dto.label;
          if(files && files['cover']) {
            post.coverImage = files['cover'].at(0)?.path?.split('src\\static')?.pop() || '';
          }

          await post.save();

        }
        else {
          post = await Homework.findByPk(recordId);
          if(!post) throw 'Домашка не найдена';
          post.title = dto.title;
          post.content = dto.content;
          post.type = dto.type as HomeworkType;
          post.startDate = dto.startDate;
          post.endDate = dto.endDate;
          post.subjectId = Number(dto.subjectId);

          await post.save();

        }
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
              url: file.path.split('src\\static').pop() as string
            });}));
        }

        return true;
      
      }
      else {
      // Means that we are creating post
        let post: News | Homework | null = null;
        if(recordTable == 'News') {
          post = await News.create({
            authorId: author.id,
            groupId: author.groupId,
            title: dto.title,
            content: dto.content,
            label: dto.label,
            coverImage: files && files['cover'] ? files['cover']?.[0]?.path?.split('src\\static')?.pop() : undefined,
          });
        }
        else {
          post = await Homework.create({
            authorId: author.id,
            groupId: author.groupId,
            title: dto.title,
            content: dto.content,
            type: dto.type as HomeworkType,
            startDate: dto.startDate,
            endDate: dto.endDate,
            subjectId: Number(dto.subjectId),
          });
        }

        if(!post) throw 'Запись не создана';
      
        const _record = await Record.findOne({ where: { recordTable, recordId: post.id } });
        if(_record && files && files['files'] && files['files'].length > 0) {
          await AppFiles.bulkCreate(files['files'].map(file => ({
            recordId: _record.id,
            fileName: file.originalname,
            fileSize: file.size,
            url: file.path.split('src\\static').pop() as string
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

  async getAllEntities(
    recordTable: string,
    page: number,
    limit: number,
    userId: number,
    groupId?: number,
    subjectId?: number,
    label?: string,
  ){
    const Entity =
    recordTable == 'News' ? News :
      recordTable == 'Homework' ? Homework :
        recordTable == 'Calendar' ? Calendar :
          Team;

    const offset = 0 + ((page - 1) * limit);

    const records = await Record.findAndCountAll({
      where: {
        recordTable,
        ...(groupId ? { groupId } : {})
      },
      offset: offset,
      limit: limit,
      attributes: {
        include: [
          [ sequelize.literal(`(
            SELECT COALESCE(
                json_agg(json_build_object(
                    'id', "UserReactions"."id",
                    'userId', "UserReactions"."userId",
                    'recordId', "UserReactions"."recordId",
                    'type', "UserReactions"."type",
                    'imageUrl', "UserReactions"."imageUrl"
                    -- Add more properties as needed
                )),
                '[]'::json
            ) AS user_reactions
            FROM 
                "UserReactions" 
            WHERE 
                "recordId" = "Record"."id" AND 
                "userId" = ${userId}
        )`),
          'meReacted' ],
          [ sequelize.literal(`(
            SELECT CASE 
              WHEN EXISTS (
                SELECT * FROM "UserFavorites" WHERE "recordId" = "Record"."id" AND "userId" = ${userId}
              ) THEN TRUE 
              ELSE FALSE 
            END
          )`),
          'meFavorited' ],
          [ sequelize.literal(`(
            SELECT COALESCE(
                json_agg(json_build_object(
                    'id', "UserTasks"."id",
                    'userId', "UserTasks"."userId",
                    'groupId', "UserTasks"."groupId",
                    'recordId', "UserTasks"."recordId",
                    'title', "UserTasks"."title",
                    'description', "UserTasks"."description",
                    'trackedTime', "UserTasks"."trackedTime",
                    'status', "UserTasks"."status",
                    'doneDate', "UserTasks"."doneDate"
                    -- Add more properties as needed
                )),
                '[]'::json
            ) AS user_tasks
            FROM 
                "UserTasks" 
            WHERE 
                "recordId" = "Record"."id" AND 
                "userId" = ${userId}
        )`),
          'meWorked' ]
        ]
      },
      include: [
        {
          model: Entity,
          where: {
            ...(subjectId && subjectId != -1 ? { subjectId } : {}),
            ...(label ? { label } : {})
          },
          
          ...(recordTable == 'Homework' ? { include: [
            Subject
          ] } : {})
          
        },
        {
          model: UserComment,
          required: false,
          include: [
            {
              model: UserComment,
              as: 'children',
              required: false,
              include: [ {
                model: Record,
                required: false,
                as: 'myRecord',
                include: [
                  {
                    model: UserReaction,
                    required: false
                  }
                ],
              } ]
            },
            {
              model: Record,
              required: false,
              as: 'myRecord',
              include: [
                {
                  model: UserReaction,
                  required: false
                }
              ],
            }
          ]
        },
        {
          model: UserFavorite,
          required: false
        },
        {
          model: UserReaction,
          required: false
        },
        {
          model: AppFiles,
          required: false
        },
        {
          model: UserView,
          required: false
        },
      ]
    });
    
    return records;
  }

  async react ( dto: {recordId: number; type: string; imageUrl: string}, userId: number) {
    try {
      const exitedReaction = await UserReaction.findOne({ where: { userId, recordId: dto.recordId } });
      if(exitedReaction) {
        if(exitedReaction.type == dto.type) {
          return await exitedReaction.destroy();
        }
        exitedReaction.type = dto.type;
        exitedReaction.imageUrl = dto.imageUrl;
        return await exitedReaction.save();
        
      }
      return await UserReaction.create({
        userId,
        type: dto.type,
        imageUrl: dto.imageUrl,
        recordId: dto.recordId
      }, { returning: true });
    }
    catch (err) {
      console.log(err);
      //TODO: add event emitter to admins
      throw 'Не удалось добавить реакцию';
    }
  }

  async favorite ( dto: { recordId: number }, userId: number) {
    try {
      const exitedFavorite = await UserFavorite.findOne({ where: { userId, recordId: dto.recordId } });
      if(exitedFavorite) {
        return await exitedFavorite.destroy();
      }
      return await UserFavorite.create({
        userId,
        recordId: dto.recordId
      });
    }
    catch (err) {
      console.log(err);
      throw 'Не удалось добавить в избранное';
    }
  }

  async view ( recordId: number , userId: number) {
    try {
      await UserView.findOrCreate({ where: { userId, recordId }, defaults: { userId, recordId } });
      return true;
    }
    catch (err) {
      console.log(err);
      throw 'Не удалось добавить просмотров';
    }
  }
   
  async comment( req: Request , userId: number, groupId: number) {
    try {
      const dto = req.body as {recordId: string; content: string; parentId: string; isNote: '0' | '1'; title: string};
      const files = req.files as unknown as { [fieldname: string]: Express.Multer.File[] }; // as {files: File[], cover: File[] but one}
      
      const comment = await UserComment.create({
        groupId,
        content: dto.content,
        recordId: Number(dto.recordId),
        userId,
        isNote: Boolean(Number(dto.isNote)), //isNote like '0' | '1'
        title: dto.title,
        myRecordId: Number(dto.recordId), // Will overwritten after create
        ...(dto.parentId != '-1' && !isNaN(Number(dto.parentId)) ? { parentId: Number(dto.parentId) } : {})

      });
      if(!comment) throw 'Комментарий не создан';
      const _record = await Record.findOne({ where: { recordTable: 'UserComment', recordId: comment.id } });
      if(_record && files && files['files'] && files['files'].length > 0) {
        await AppFiles.bulkCreate(files['files'].map(file => ({
          recordId: _record.id,
          fileName: file.originalname,
          fileSize: file.size,
          url: file.path.split('src\\static').pop() as string
        })));
      }
    }
    catch (err) {
      console.log(err);
      throw 'Не удалось добавить комментарий';
    }
  }

}

export default new RecordService();