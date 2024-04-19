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
import { UserComment } from "../models/user-comments.model";
import { UserFavorite } from "../models/user-favorites.model";
import { UserReaction } from "../models/user-reactions.model";
import { UserTask } from "../models/user-tasks.model";
import { UserView } from "../models/user-views.model";
import { sequelize } from "../db";

class RecordService {

  async getEntity(recordTable: string, recordId: number, userId: number, groupId?: number) {
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
        Entity,
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
          model: UserTask,
          where: { userId },
          required: false
        }
      ]
    });

    if(!record) throw 'Record not found';

    return record;

  }

  async createOrUpdatePost(recordTable: string, recordId: number, req: Request) {
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
    };
    const files = req.files as unknown as { [fieldname: string]: Express.Multer.File[] }; // as {files: File[], cover: File[] but one}
    const author = (req as IUserReq).user;

    const record = await Record.findOne({ where: { recordTable, recordId } });
    if(record) {
      //TODO: Update post algo
      // Means that we are updating post
      let post: News | Homework | null = null;
      if(recordTable == 'News') {
        post = await News.findByPk(recordId);
      }
      else {
        post = await Homework.findByPk(recordId);
      }

      if(!post) throw 'Post not found';
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

      if(!post) throw 'Post was not created';
      
      const _record = await Record.findOne({ where: { recordTable, recordId: post.id } });
      if(_record && files && files['files'].length > 0) {
        await AppFiles.bulkCreate(files['files'].map(file => ({
          recordId: _record.id,
          //TODO: Исправить кодировку
          fileName: file.originalname,
          fileSize: file.size,
          url: file.path.split('src\\static').pop() as string
        })));
      }

      return true;
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

}

export default new RecordService();