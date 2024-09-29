import { Op, Order, WhereOptions } from "sequelize";
import { User, UserStatus } from "../../models/user.model";
import { useArrayFromStringParam, useSortModel } from "../../shared/utils/queryHelpers";
import { UserSetting } from "../../models/user-settings.model";
import { defaultUserIncludes } from "./default/user.includes";

class UserAdminService {

  async getUsers (page: number, limit: number, roleIds?: string, groupIds?: string, searchByFio?: string, sortmodel?: string, showDeleted?: boolean) {
    const offset = page * limit;
    const where: WhereOptions<User> = {};
    const order = useSortModel(sortmodel);
    useArrayFromStringParam<number>(roleIds, (roles) => where.roleId = roles);
    useArrayFromStringParam<number>(groupIds, (groups) => where.groupId = groups);
   
    if(searchByFio) {
      // @ts-expect-error unexisted key
      where[Op.or] = [
        { firstName: { [Op.iLike]: `%${searchByFio}%` } },
        { lastName: { [Op.iLike]: `%${searchByFio}%` } },
        { patronymic: { [Op.iLike]: `%${searchByFio}%` } },
      ];
    }

    if(!showDeleted) {
      where.status = {
        [Op.not]: UserStatus.deleted
      };
    }
  
    return await User.findAndCountAll({
      offset,
      limit,
      where,
      order,
      include: defaultUserIncludes,
      attributes:{
        exclude: [ 'password' ]
      }
    });
  }

  async removeUser (userId: number) {
    const user = await User.findByPk(userId);
    if(!user) throw 'Такого пользователя не существует';
    const userSettings = await UserSetting.findOne({ where: { userId } });
    userSettings!.displayingName = 'nickname';
    user.nickname = "Удаленный аккаунт";
    user.status = UserStatus.deleted;
    await user.save();
    await userSettings!.save();
  }

  async restoreUser (userId: number) {
    const user = await User.findByPk(userId);
    if(!user) throw 'Такого пользователя не существует';
    const userSettings = await UserSetting.findOne({ where: { userId } });
    userSettings!.displayingName = 'fio';
    user.nickname = '';
    user.status = UserStatus.approved;
    await user.save();
    await userSettings!.save();
  }

}

export default new UserAdminService();