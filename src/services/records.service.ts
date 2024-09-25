import { Homework, HomeworkType } from "../models/homeworks.model";

import { AppFiles } from "../models/files.model";
import { Calendar } from "../models/calendar.model";
import { IUserReq } from "../shared/interfaces/req";
import { Log } from "../models/logs.model";
import { News } from "../models/news.model";
import { Order } from "sequelize";
import { Record } from "../models/records.model";
import { Request } from "express";
import { Server } from "socket.io";
import { Subject } from "../models/subject.model";
import { Team } from "../models/teams.model";
import { Timetable } from "../models/timetable.model";
import { User } from "../models/user.model";
import { UserComment } from "../models/user-comments.model";
import { UserFavorite } from "../models/user-favorites.model";
import { UserNotification } from "../models/user-notifications.model";
import { UserReaction } from "../models/user-reactions.model";
import { UserSetting } from "../models/user-settings.model";
import { UserTask } from "../models/user-tasks.model";
import { UserTaskStatus } from './../models/user-tasks.model';
import { UserView } from "../models/user-views.model";
import { extractPathFromUrl } from "../shared/utils/fixPathFiles";
import fs from 'fs';
import logService from "./log.service";
import moment from "moment";
import notificationService from "./notification.service";
import path from 'path';
import { sequelize } from "../db";
import { CustomActivity } from "../models/custom-activities.model";

class RecordService {

  async getEntity(recordTable: string, recordId: number, userId: number, groupId?: number) {
    try {
      const Entity =
    recordTable == 'News' ? News :
      recordTable == 'Homework' ? Homework :
        recordTable == 'Calendar' ? Calendar :
          recordTable == 'UserTask' ? UserTask :
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
        order: [ [ { model: UserComment, as: 'comments' }, { model: UserComment, as: 'children' }, 'createdAt', 'ASC' ] ],
        include: [
          {
            
            ...(recordTable == 'UserTask' ? { model: UserTask, as: 'userTask' } : { model: Entity }),

            ...(recordTable == 'Homework' ? { include: [
              Subject
            ] } : {}),
            
            ...(recordTable == 'News' ? { include: [
              { model: User, as: 'author', include: [ UserSetting ] }
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
                  },
                  {
                    model: AppFiles,
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
                      },
                      {
                        model: AppFiles,
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
            as: 'userTasks',
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

  async getEntityUserTasks(recordId: number, userId: number, groupId?: number) {
    try {
    
      const record = await Record.findOne({
        where: { recordTable: 'Homework', recordId },
        include: [
          {
            model: UserTask,
            required: false,
            as: 'userTasks',
            include: [
              { model: User, include: [ UserSetting ] }
            ]
          }
        ]
      });

      if(!record) throw 'Record not found';
      
      return record.userTasks;
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
      const files = req.files as unknown as { [fieldname: string]: Express.Multer.File[] }; // as {files: File[], cover: File[] - but one}
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
            post.coverImage = files['cover'].at(0)?.path ? '/' + extractPathFromUrl(files['cover'].at(0)!.path!) : '';
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
              url: '/' + extractPathFromUrl(file.path)
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
            coverImage: (!files['cover'] || files['cover'].length == 0) ? null : files['cover'].at(0)!.path ? '/' + extractPathFromUrl(files['cover'].at(0)!.path!) : '',
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

  async getAllEntities(
    recordTable: string,
    page: number,
    limit: number,
    userId: number,
    groupId?: number,
    subjectId?: number,
    label?: string,
    favorites?: string,
    deadlineDateSort?: string,
    publishDateSort?: string,
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
      order: [ [ 'createdAt', 'DESC' ] ],
      offset: offset,
      limit: limit,
      ...(publishDateSort && publishDateSort !== 'none' ? { order: [ [ 'createdAt', publishDateSort ] ] } : {}),
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
            ...(label && label != '-1' ? { label } : {})
          },
          
          ...(recordTable == 'Homework' ? { include: [
            Subject
          ] } : {}),

          ...(recordTable == 'News' ? { include: [
            { model: User, as: 'author', include: [ UserSetting ] }
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
          ...(favorites && favorites != '-1' ? {
            where: { userId },
            required: true
          } : { required: false })
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

    if(recordTable == 'Homework' && deadlineDateSort && deadlineDateSort !== 'none' ) {
      records.rows.sort((a, b) => {
        const deadlineA = moment(a.homework.endDate);
        const deadlineB = moment(b.homework.endDate);
        // Compare deadline dates
        if (deadlineA.isBefore(moment(), 'day') && deadlineB.isBefore(moment(), 'day')) {
          return 0; // If both are before today, maintain their current order
        } else if (deadlineA.isBefore(moment(), 'day')) {
          return 1; // If only a is before today, b should come first
        } else if (deadlineB.isBefore(moment(), 'day')) {
          return -1; // If only b is before today, a should come first
        } else {
          return deadlineDateSort === 'ASC' ? deadlineA.diff(deadlineB) : deadlineB.diff(deadlineA);
        }
      });
    }
    
    return records;
  }

  async react ( dto: {recordId: number; type: string; imageUrl: string}, userId: number, io: Server) {
    try {
      const record = await Record.findByPk(dto.recordId);
      if(!record) throw 'Record not found';

      const exitedReaction = await UserReaction.findOne({ where: { userId, recordId: dto.recordId } });
      if(exitedReaction) {
        if(exitedReaction.type == dto.type) {
          if(record.recordTable == 'UserComment') {
            logService.usingAchievement('userReacted', userId, io, record.id, 'destroy');
          }
          return await exitedReaction.destroy();
        }
        exitedReaction.type = dto.type;
        exitedReaction.imageUrl = dto.imageUrl;
        return await exitedReaction.save();
        
      }
      if(record.recordTable == 'UserComment') {
        logService.usingAchievement('userReacted', userId, io, record.id, 'create');
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

  async remove ( recordId: number , userId: number) {
    try {
      const toRemoveRecord = await Record.findByPk(recordId, { include: [ AppFiles ] });
      if(toRemoveRecord) {
        // delete files
        // TODO: delete files from drive too
        if(toRemoveRecord.files) {
          await AppFiles.destroy({ where: { id: toRemoveRecord.files.map(f => f.id) } });
        }

        const recordTable = toRemoveRecord.recordTable;
        const Entity =
        recordTable == 'News' ? News :
          recordTable == 'Homework' ? Homework :
            recordTable == 'Calendar' ? Calendar :
              recordTable == 'CustomActivity' ? CustomActivity :
                recordTable == 'UserTask' ? UserTask :
                  Team;
        //@ts-expect-error "Model type"
        await Entity.destroy({ where: { id: toRemoveRecord.recordId } });

        if(Entity instanceof Homework) {
          await UserTask.destroy({ where: { id: toRemoveRecord.id } });
        }

        await toRemoveRecord.destroy();
      }

      return true;
    }
    catch (err) {
      console.log(err);
      throw 'Не удалось удалить';
    }
  }

  async getFavorites (userId: number) {
    try {
      return await UserFavorite.findAll({ where: { userId } });
    }
    catch (err) {
      console.log(err);
      throw 'Не удалось найти избранные';
    }
  }
   
  async comment( req: Request , userId: number, groupId: number, io: Server) {
    try {
      const dto = req.body as { replyToUserId: string; recordId: string; content: string; parentId: string; isNote: '0' | '1'; title: string};
      const files = req.files as unknown as { [fieldname: string]: Express.Multer.File[] }; // as {files: File[], cover: File[] but one}
      
      const comment = await UserComment.create({
        groupId,
        content: dto.content,
        recordId: Number(dto.recordId),
        userId,
        isNote: Boolean(Number(dto.isNote)), //isNote like '0' | '1'
        title: dto.title,
        myRecordId: Number(dto.recordId), // Will overwritten after create
        ...(dto.parentId != '-1' && !isNaN(Number(dto.parentId)) ? { parentId: Number(dto.parentId) } : {}),
        ...(dto.replyToUserId != '-1' && !isNaN(Number(dto.replyToUserId)) ? { replyToUserId: Number(dto.replyToUserId) } : {})

      });
      if(!comment) throw 'Комментарий не создан';
      logService.usingAchievement('userCommented', userId, io);
      
      if(comment.replyToUserId) {
        /**Создаем уведомление для пользователя, которому ответили на комментарий */
        const currentComment = await UserComment.findByPk(comment.id, { include: [ User ] });

        if(currentComment && currentComment.userId !== comment.replyToUserId) {
          // сами себе не создаем уведомление ^
          await notificationService.createNote({
            recordId: comment.recordId,
            content: comment.content,
            authorId: currentComment.user.id,
            title: `Ответил(а) на Ваш комментарий`,
            userId: comment.replyToUserId,
          }, io);
          
        }
      }
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