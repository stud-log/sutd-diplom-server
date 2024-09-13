import { Op, WhereOptions } from "sequelize";
import { User } from "../../models/user.model";

class UserAdminService {

  async getUsers (page: number, limit: number, roleIds?: string, groupIds?: string, fio?: string) {
    const offset = 0 + ((page - 1) * limit);
    const where: WhereOptions<User> = {};
    if(roleIds) {
      where.roleId = JSON.parse(roleIds) as number[];
    }
    if(groupIds) {
      where.groupId = JSON.parse(groupIds) as number[];
    }
    if(fio) {
      where[Op.or] = [
        { firstName: { [Op.iLike]: `%${fio}%` } },
        { lastName: { [Op.iLike]: `%${fio}%` } },
      ];
    }
    return await User.findAll({
      offset,
      limit,
      order: [ [ 'lastName', 'ASC' ] ],
      where
    });
  }

}

export default new UserAdminService();