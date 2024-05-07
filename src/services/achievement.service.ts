import { Log, LogType } from "../models/logs.model";
import { User, UserStatus } from "../models/user.model";

import { Achievement } from "../models/achievements.model";
import { Group } from "../models/group.model";
import { Server } from "socket.io";
import { UserAchievement } from "../models/user-achievements.model";
import { UserSetting } from "../models/user-settings.model";

class AchievementService {

  async all() {
    return await Achievement.findAll();
  }

  /**
   * Смотрим, не получил ли пользователь достижение, связанное с частотой захода в приложение
   */
  async checkForAchievementByEntrance(userId: number, io: Server) {
    const guideSeen = await Log.findOne({ where: { userId, type: LogType.readGuide } });
    if(!guideSeen) return; // просто чтобы не спамить. Выдадим достижение после прохождения туториала.

    const entrances = await Log.findAndCountAll({ where: { userId, type: LogType.entrance } });
    const count = entrances.count;
    
    const achievement = await Achievement.findOne({ where: { condition: { entrance: count } } });
    if(achievement) {
      const isAlreadyReceived = await UserAchievement.findOne({ where: { userId, achievementId: achievement.id } });
      if(!isAlreadyReceived) {
        // пользователю нужно выдать достижение
        await UserAchievement.create({ userId, achievementId: achievement.id });
        io.emit('achievementReceived', { userId, achievement });
      }
    }
    
  }

}

export default new AchievementService();