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

  async allWithProgress(userId: number) {
    try {

      const achievements = await Achievement.findAll();
      
      const calculated = await Promise.all(achievements.map(async (achievement) => {
        const progress = await achievement.getProgress(userId);
        return ({
          id: achievement.id,
          title: achievement.title,
          description: achievement.description,
          condition: achievement.condition,
          trophy: achievement.trophy,
          imgSrc: achievement.imgSrc,
          progress
        });
      }));
      return calculated;
    }
    catch (e) {
      console.log(e);
      throw 'Cant load';
    }
  }

  /**
   * Смотрим, не получил ли пользователь достижение
   */
  async checkForAchievement(userId: number, io: Server) {
    const guideSeen = await Log.findOne({ where: { userId, type: LogType.readGuide } });
    if(!guideSeen) return; // просто чтобы не спамить. Выдадим достижение после прохождения туториала.
    
    const achievements = (await this.allWithProgress(userId)).filter(i => i.progress == 100);
    await Promise.all(achievements.map(async achievement => {
     
      const isAlreadyReceived = await UserAchievement.findOne({ where: { userId, achievementId: achievement.id } });
      if(!isAlreadyReceived) {
        // пользователю нужно выдать достижение
        await UserAchievement.create({ userId, achievementId: achievement.id });
        await Log.create({ userId, type: LogType.gotAchievement, isPublic: true });
        io.emit('achievementReceived', { userId, achievement });
      }
    }));
    
  }

  async markAsSeen (userId: number){
    return await Log.update({ isSeen: true }, { where: {
      userId,
    } });
  }

  async checkUnSeen (userId: number) {
    const unseened = await Log.findAll({ where: { userId, type: LogType.gotAchievement, isSeen: false } });
    return unseened.length > 0 ? true : false;
  }

}

export default new AchievementService();