import { Homework, HomeworkType } from "../models/homeworks.model";

import { AppFiles } from "../models/files.model";
import { IUserReq } from "../shared/interfaces/req";
import { News } from "../models/news.model";
import { Record } from "../models/records.model";
import { Request } from "express";
import { Subject } from "../models/subject.model";
import { Timetable } from "../models/timetable.model";
import { UserComment } from "../models/user-comments.model";
import { UserReaction } from "../models/user-reactions.model";
import { UserTask } from "../models/user-tasks.model";
import { UserView } from "../models/user-views.model";

class RecordService {

  async getPost(recordTable: string, recordId: number, userId: number) {
    const record = await Record.findOne({ where: { recordTable, recordId } });
    if(!record) throw 'Record not found';

    let post: News | Homework | null = null;
    if(recordTable == 'News') {
      post = await News.findByPk(recordId);
    }
    else {
      post = await Homework.findByPk(recordId, { include: [ Subject ] });
    }

    if(!post) throw 'Post not found';

    const _comments = await UserComment.findAll({ where: { recordId: record.id } });
    const _commentsReactions = await UserReaction.findAll({ where: { recordId: _comments.map(c => c.id) } });
    const postComments = _comments.map(comment => {
      const commentReactions = _commentsReactions.filter(reaction => reaction.recordId === comment.id);
      return {
        ...comment,
        reactions: commentReactions
      };
    });

    const postReactions = await UserReaction.findAll({ where: { recordId: record.id } });
    const postFiles = await AppFiles.findAll({ where: { recordId: record.id } });
    const postViews = await UserView.findAll({ where: { recordId: record.id } });
    const asUserTask = await UserTask.findOne({ where: { recordId: record.id, userId } });

    return {
      record,
      post,
      postComments,
      postReactions,
      postFiles,
      postViews: postViews.length,
      asUserTask
    };

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
    const authorId = (req as IUserReq).user.id;

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
          authorId,
          title: dto.title,
          content: dto.content,
          label: dto.label,
          coverImage: files && files['cover'] ? files['cover']?.[0]?.path?.split('src\\static')?.pop() : undefined,
        });
      }
      else {
        post = await Homework.create({
          authorId,
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

  async getAllPosts(recordTable: string, page: number, limit: number, userId: number){
    const offset = 0 + ((page - 1) * limit);

    const records = await Record.findAndCountAll({
      where: { recordTable },
      offset: offset,
      limit: limit
    });
    const rows = await Promise.all(records.rows.map(record => this.getPost(recordTable, record.recordId, userId)));
    return {
      rows,
      count: records.count
    };
  }

}

export default new RecordService();