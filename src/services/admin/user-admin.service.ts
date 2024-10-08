import { Op, Order, WhereOptions } from "sequelize";
import { User, UserStatus } from "../../models/user.model";
import { useArrayFromStringParam, useSortModel } from "../../shared/utils/queryHelpers";
import { UserSetting } from "../../models/user-settings.model";
import { defaultUserIncludes } from "./default/user.includes";
import { RegDTO } from "@stud-log/news-types/dto";
import groupService from "../group.service";
import roleService from "../role.service";
import { UserRole } from "../../models/user-roles.model";
import userService from "../user.service";
import subjectsService from "../subjects.service";

class UserAdminService {

  async getUsers (callerId: number, page: number, limit: number, roleIds?: string, groupIds?: string, statuses?: string, searchByFio?: string, sortmodel?: string, showDeleted?: boolean) {
    const offset = page * limit;
    const where: WhereOptions<User> = {};
    const order = useSortModel(sortmodel);

    if(!showDeleted) {
      where.status = {
        [Op.not]: UserStatus.deleted
      };
    }

    useArrayFromStringParam<number>(roleIds, (roles) => where.roleId = roles);
    useArrayFromStringParam<number>(groupIds, (groups) => where.groupId = groups);
    useArrayFromStringParam<string>(statuses, (status) => where.status = status);
   
    if(searchByFio) {
      // @ts-expect-error unexisted key
      where[Op.or] = [
        { firstName: { [Op.iLike]: `%${searchByFio}%` } },
        { lastName: { [Op.iLike]: `%${searchByFio}%` } },
        { patronymic: { [Op.iLike]: `%${searchByFio}%` } },
      ];
    }

    where.id = {
      [Op.not]: callerId
    };
  
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

  async createOrUpdateUser (regDto: RegDTO & {userId: number; roleId: number; subjectsIds: number[]; subjectsIdsToDelete: number[]}) {
    const isNewUser = regDto.userId === -1;
    
    if(isNewUser) {
      const isUserExist = await User.findOne({ where: { email: regDto.email } });
      if (isUserExist) {
        throw `Такой email уже зарегистрирован`;
      }
    }

    const role = await UserRole.findByPk(regDto.roleId);
    
    if(!role) throw "Такой роли не существует"; // must have not to be here
    const superAdminRole = await roleService.getSuperAdminRole();

    const isStudent = (await roleService.getStudentRoles()).map(i => i.id).includes(role.id);
    const isTeacher = (await roleService.getTeacherRoles()).map(i => i.id).includes(role.id);
    const isAdmin = (await roleService.getAdminRoles()).map(i => i.id).includes(role.id);

    const group =
    isStudent ? await groupService.getByPK(regDto.groupId)
      : isTeacher ? await groupService.getTeachersGroup()
        : isAdmin ? await groupService.getAdminsGroup()
          : undefined;

    if(!group && isStudent) throw "Для этой роли нужно указать группу";
    if(!group) throw "Такой группы не существует"; // must have not to be here
    if(role.id === superAdminRole!.id) throw "Вы не можете создать пользователя с такой ролью"; // must have not to be here

    if(isNewUser){
      const user = await User.create(
        {
          email: regDto.email.trim().toLowerCase(),
          status: UserStatus.approved,
          firstName: regDto.firstName.trim(),
          lastName: regDto.lastName.trim(),
          patronymic: regDto.patronymic.trim(),
          phone: regDto.phone,
          roleId: role.id,
          groupId: group.id,
          avatarUrl: '/_defaults/avatars/1.svg',
          createdFromAdminPanel: true
        },
        { returning: true, },
      );
  
      //TODO: change to send activation email template
      await userService.passRecovery({ email: user.email });
      
      if(isTeacher && regDto.subjectsIds.length > 0) {
        await subjectsService.assignTeacher(user.id, regDto.subjectsIds);
      }
    }
    else {
      const existedUser = await User.findByPk(regDto.userId);
      if(!existedUser) throw 'Такого пользователя не существует';

      if(existedUser.email !== regDto.email) {
        await userService.passRecovery({ email: regDto.email });
      }

      await existedUser.update(
        {
          email: regDto.email.trim().toLowerCase(),
          status: UserStatus.approved,
          firstName: regDto.firstName.trim(),
          lastName: regDto.lastName.trim(),
          patronymic: regDto.patronymic.trim(),
          phone: regDto.phone,
          roleId: role.id,
          groupId: group.id,
        }
      );

      //TODO: send email to user to notify him about changes

      if(isTeacher && regDto.subjectsIdsToDelete.length > 0) {
        await subjectsService.unassignTeacher(existedUser.id, regDto.subjectsIdsToDelete);
      }
      
      if(isTeacher && regDto.subjectsIds.length > 0) {
        await subjectsService.assignTeacher(existedUser.id, regDto.subjectsIds);
      }
    }
    
    return true;
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