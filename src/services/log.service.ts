import { Log, LogType } from "../models/logs.model";

import { Achievement } from "../models/achievements.model";
import { Op } from "sequelize";
import { UserAchievement } from "../models/user-achievements.model";
import em from './event-emmiter';
import moment from "moment";

class AchievementsLogService {

  async userEnter(userId: number) {
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

      this.checkForAchievementByEntrance(userId);
    }
    catch (e) {
      console.log(e);
      throw 'Не удалось зафиксировать вход';
    }

  }

  /**
   * Смотрим, не получил ли пользователь достижение, связанное с частотой захода в приложение
   */
  async checkForAchievementByEntrance(userId: number) {
    if(!(await this.isGuideSeen(userId))) return; // просто чтобы не спамить. Выдадим достижение после прохождения туториала.

    const entrances = await Log.findAndCountAll({ where: { userId, type: LogType.entrance } });
    const count = entrances.count;
    
    const achievement = await Achievement.findOne({ where: { condition: { entrance: count } } });
    if(achievement) {
      const isAlreadyReceived = await UserAchievement.findOne({ where: { userId, achievementId: achievement.id } });
      if(!isAlreadyReceived) {
        // пользователю нужно выдать достижение
        await UserAchievement.create({ userId, achievementId: achievement.id });
        em.publish('achievementReceived', userId, achievement);
      }
    }
  }

  async isGuideSeen (userId: number) {
    const guideSeen = await Log.findOne({ where: { userId, type: LogType.readGuide } });
    return !!guideSeen;
  }

}

export default new AchievementsLogService();