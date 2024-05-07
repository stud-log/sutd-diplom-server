import { Log, LogType } from "../models/logs.model";

import { Achievement } from "../models/achievements.model";
import { Op } from "sequelize";
import { Server } from 'socket.io';
import { UserAchievement } from "../models/user-achievements.model";
import achievementService from "./achievement.service";
import moment from "moment";

class AchievementsLogService {

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

      achievementService.checkForAchievementByEntrance(userId, io);
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

}

export default new AchievementsLogService();