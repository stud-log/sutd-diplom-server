import { User, UserStatus } from "../models/user.model";
import { UserNotification, UserNotificationAttrs } from "../models/user-notifications.model";

import { Group } from "../models/group.model";
import { Op } from "sequelize";
import { Record } from "../models/records.model";
import { Server } from "socket.io";
import { UserSetting } from "../models/user-settings.model";

class NotficationService {

  async getUserNotifications (userId: number) {
    
    return await UserNotification.findAll({ where: { userId }, order: [ [ 'isSeen', 'ASC' ] ], include: [
      Record,
      {
        model: User,
        as: 'author',
        include: [ UserSetting ]
      }
    ] });
    
  }

  async checkUnSeen (userId: number) {
    const unseened = await UserNotification.findAll({ where: { userId, isSeen: false } });
    return unseened.length > 0 ? true : false;
  }

  async getSystemAcc () {
    return await User.findOne({ where: { firstName: "Система", lastName: 'Stud.log' } });

  }

  async createNoteFromSystem(dto: Omit<UserNotificationAttrs, 'authorId' | 'isSeen'>, io: Server) {
    const sys = await this.getSystemAcc();
    if (sys) {
      const note = await UserNotification.create({ ...dto, authorId: sys.id, isSeen: false });
      const _note = await UserNotification.findByPk(note.id, {
        include: [
          Record,
          {
            model: User,
            as: 'author',
            include: [ UserSetting ]
          }
        ]
      });
      io.emit('notification', { userId: dto.userId, notification: _note });
      return note;
    }
    throw 'Не удалось создать уведомление от системного аккаунта';
  }

  async createNote(dto: Omit<UserNotificationAttrs, 'isSeen'>, io: Server) {
    try {
      const note = await UserNotification.create({ ...dto, isSeen: false });
      const _note = await UserNotification.findByPk(note.id, { include: [
        Record,
        {
          model: User,
          as: 'author',
          include: [ UserSetting ]
        }
      ]
      });
      io.emit('notification', { userId: dto.userId, notification: _note });
      return note;
    }
    catch (e) {
      console.log(e);
      throw 'Не удалось создать уведомление';
    }
  }

  async markAsSeen (userId: number, noteId?: string){
    
    return await UserNotification.update({ isSeen: true }, { where: {
      userId,
      ...(noteId && !isNaN(Number(noteId)) ? { id: Number(noteId) } : {} )
    } });
    
  }

}

export default new NotficationService();