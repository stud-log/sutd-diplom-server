import { Log, LogType } from "../models/logs.model";

import { Achievement } from "../models/achievements.model";
import { Op } from "sequelize";
import { Record } from "../models/records.model";
import { Server } from 'socket.io';
import { UserAchievement } from "../models/user-achievements.model";
import { UserComment } from "../models/user-comments.model";
import achievementService from "./achievement.service";
import moment from "moment";

/** Methods be call through usingAchievement */
class AchievementsLogService {

  /**
   * обертка для вызова остальных функций. Создает лог и проверяет на достижения
   */
  async usingAchievement(fnName: keyof AchievementsLogService, userId: number, io: Server, ...args: any[]) {
    const fn = this[fnName] as (...args: any[]) => Promise<any>;
    if (typeof fn !== 'function') {
      throw new Error(`Function ${fnName} does not exist in AchievementsLogService`);
    }

    return await fn(userId, io, ...args).then(async (r) => {
      achievementService.checkForAchievement(userId, io);
      return r;
    });
  }

  async userEnter(userId: number, io: Server) {
    try {
      const lastEnter = await Log.findOne({ where: { userId, type: LogType.entrance }, order: [ [ 'createdAt', 'DESC' ] ] });
      if(!lastEnter) {
        await Log.create({ type: LogType.entrance, userId, isPublic: true } );
        return;
      }
    
      const lastTimeEntry = moment(lastEnter.createdAt);
      const yesterdayStart = moment().subtract(1, 'day').startOf('day');
      const yesterdayEnd = moment().subtract(1, 'day').endOf('day');

      if(lastTimeEntry.isBetween(yesterdayStart, yesterdayEnd)){
      // отмечаем заход в приложение раз в сутки
        await Log.create({ type: LogType.entrance, userId, isPublic: true } );
      }
    }
    catch (e) {
      console.log(e);
      throw 'Не удалось зафиксировать вход';
    }

  }

  async isGuideSeen (userId: number) {
    const guideSeen = await Log.findOne({ where: { userId, type: LogType.readGuide } });
    return !!guideSeen;
  }

  async userCommented(userId: number, io: Server) {
    try {
      await Log.create({ type: LogType.comment, userId, isPublic: true } );
      return true;
    }
    catch (e) {
      console.log(e);
      throw 'Не удалось зафиксировать комментарий';
    }
  }

  async userReacted(userId: number, io: Server, recordId: number, action: 'destroy' | 'create') {
    try {
      const comment = await UserComment.findOne({
        where: {
          myRecordId: recordId,
        }
      });

      if(!comment) throw 'Cannot find comment';

      if(action === 'create') {
        await Log.create({ type: LogType.myCommentReacted, userId: comment.userId, recordId, isPublic: false } );
        return true;
      }

      if(action === 'destroy') {
        try {
          await Log.destroy({ where: { recordId, userId: comment.userId, type: LogType.myCommentReacted } });
          return true;
        }
        catch(e){
          console.log(e);
        }
      }
      
    }
    catch (e) {
      console.log(e);
      throw 'Не удалось зафиксировать комментарий';
    }
  }

}

export default new AchievementsLogService();