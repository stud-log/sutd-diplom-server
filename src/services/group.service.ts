import { User, UserStatus } from "../models/user.model";

import { Group } from "../models/group.model";
import { Op } from "sequelize";
import { UserSetting } from "../models/user-settings.model";

class GroupService {

  async getAll() {
    return await Group.findAll({ where: { name: { [Op.not]: 'Stud.log' } } });
  }

  async getByPK(id: number) {
    return await Group.findByPk(id);
  }

  async getByName(name: string) {
    return await Group.findOne({ where: { name } });
  }

  async groupUsers(groupId: number) {
    return await User.findAll({ where: { groupId, status: [ UserStatus.approved, UserStatus.inReview ] }, order: [ [ 'status', 'ASC' ] ], include: [ { model: UserSetting, required: false } ] });
  }

}

export default new GroupService();