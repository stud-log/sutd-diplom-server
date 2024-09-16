import { Op, Order, WhereOptions } from "sequelize";
import { User } from "../../models/user.model";
import { useArrayFromStringParam, useSortModel } from "../../shared/utils/queryHelpers";

class UserAdminService {

  async getUsers (page: number, limit: number, roleIds?: string, groupIds?: string, fio?: string, sortmodel?: string) {
    const offset = 0 + ((page - 1) * limit);
    const where: WhereOptions<User> = {};
    const order = useSortModel(sortmodel);
    useArrayFromStringParam<number>(roleIds, (roles) => where.roleId = roles);
    useArrayFromStringParam<number>(groupIds, (groups) => where.groupId = groups);
   
    if(fio) {
      // @ts-expect-error unexisted key
      where[Op.or] = [
        { firstName: { [Op.iLike]: `%${fio}%` } },
        { lastName: { [Op.iLike]: `%${fio}%` } },
      ];
    }
    return await User.findAndCountAll({
      offset,
      limit,
      where,
      order
    });
  }

}

export default new UserAdminService();