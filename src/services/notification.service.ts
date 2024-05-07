import { User, UserStatus } from "../models/user.model";
import { UserNotification, UserNotificationAttrs } from "../models/user-notifications.model";

import { Group } from "../models/group.model";
import { Op } from "sequelize";
import { Record } from "../models/records.model";
import { Server } from "socket.io";
import { UserSetting } from "../models/user-settings.model";

class NotficationService {
  async getSystemAcc () {
    return await User.findOne({ where: { firstName: "Система", lastName: 'Stud.log' } });

  }

  async createNoteFromSystem(dto: Omit<UserNotificationAttrs, 'authorId' | 'isSeen'>, io: Server) {
    const sys = await this.getSystemAcc();
    if (sys) {
      const note = await UserNotification.create({ ...dto, authorId: sys.id, isSeen: false });
      const _note = await UserNotification.findByPk(note.id, { include: [ Record ] });
      io.emit('notification', { userId: dto.userId, notification: _note });
      return note;
    }
    throw 'Не удалось создать уведомление от системного аккаунта';
  }

}

export default new NotficationService();