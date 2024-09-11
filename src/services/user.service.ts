import { Log, LogType } from '../models/logs.model';
import { LoginDTO, RegDTO, ResetPasswordDTO } from '@stud-log/news-types/dto';
import { User, UserStatus } from "../models/user.model";

import { Achievement } from '../models/achievements.model';
import { ApiError } from '../shared/error/ApiError';
import { AppFiles } from '../models/files.model';
import { Group } from '../models/group.model';
import { Homework } from '../models/homeworks.model';
import { Record } from '../models/records.model';
import { RolePermission } from "../models/role-permissions.model";
import { RoleNames, RoleService } from './role.service';
import { Subject } from '../models/subject.model';
import { TemporaryLink } from '../models/tmp-links.model';
import { UserAchievement } from '../models/user-achievements.model';
import { UserComment } from '../models/user-comments.model';
import { UserRole } from "../models/user-roles.model";
import { UserSetting } from '../models/user-settings.model';
import { UserTask } from '../models/user-tasks.model';
import bcrypt from 'bcryptjs';
import groupService from "./group.service";
import logService from './log.service';
import { mailRecoveryTemplate } from '../shared/templates/mail/recovery.template';
import mailService from './mail.service';
import recoveryService from './recovery.service';
import tokenService from './token.service';

class UserService {
  private roleService = new RoleService();

  async getAll() {
    return await User.findAll();
  }

  /**
   * __NOTE__:
   * Если заполнены поля задачи, и указано recordId - это значит, что мы создали свою задачу рамках какой то record сущности. Предполагается, что в рамках сущности teams.
   * Если заполнено только recordId, значит мы просто взяли домашку в работу.
   * Если же задача полностью кастомная, то recordId вообще не будет.
   * Если заполнено parentId, то задача является зависимой от указанной задачи. parentId обязательно ссылается только на UserTask, чем бы он ни был
   */
  async myTasks(id: number) {
    try {
      return await UserTask.findAll({
        where: {
          userId: id,
        },
        include: [
          {
            model: Record,
            required: false,
            as: 'record',
            /** если найдется, будет значить, что это домашка, взятая в работу */
            include: [
              {
                model: Homework,
                include: [
                  Subject,
                  {
                    model: Record,
                    required: false,
                    include: [
                      AppFiles
                    ]
                  }
                ]
              }
            ]
          },
          {
            model: Record,
            required: false,
            as: 'myRecord',
            /** нужно для того чтобы прицепить комментарии. а точнее заметки(!) */
            include: [
              {
                model: UserComment,
                required: false,
                include: [
                  {
                    model: Record,
                    required: false,
                    as: 'myRecord',
                    include: [
                      AppFiles
                    ]
                  }
                ]
              }
            ]
          },
          {
            model: UserTask,
            required: false,
            as: 'children'
          }
        ]
      });
    }
    catch(e) {
      console.log(e);
      throw 'Ошибка при получении данных';
    }
  }

  async getTask(taskId: number) {
    try {
      return await UserTask.findOne({
        where: {
          id: taskId
        },
        include: [
          {
            model: Record,
            required: false,
            as: 'record',
            /** если найдется, будет значить, что это домашка, взятая в работу */
            include: [
              {
                model: Homework,
                include: [
                  Subject,
                  {
                    model: Record,
                    required: false,
                    include: [
                      AppFiles
                    ]
                  }
                ]
              }
            ]
          },
          {
            model: Record,
            required: false,
            as: 'myRecord',
            /** нужно для того чтобы прицепить комментарии. а точнее заметки(!) */
            include: [
              AppFiles,
              {
                model: UserComment,
                required: false,
                include: [
                  {
                    model: User,
                    include: [ UserSetting ]
                  },
                  {
                    model: Record,
                    required: false,
                    as: 'myRecord',
                    include: [
                      AppFiles
                    ]
                  }
                ]
              }
            ]
          },
          {
            model: UserTask,
            required: false,
            as: 'children'
          }
        ]
      });
    }
    catch(e) {
      console.log(e);
      throw 'Ошибка при получении данных';
    }
  }

  async seenGuideLine(userId: number) {
    try {
      await Log.create({ userId, type: LogType.readGuide, isPublic: true });
      return true;
    }
    catch (e) {
      console.log(e);
      throw 'Не удалось отметить прочтение гайдлайна';
    }
  }

  async getMe(id: number) {
    try {
      return await User.findByPk(id, {
        
        include: [
          { model: UserRole,
            include: [ RolePermission ]
          },
          Group,
          UserSetting,
          {
            model: UserAchievement,
            include: [
              Achievement
            ]
          }
        ] });
    }
    catch (e) {
      console.log(e);
      throw 'Не удалось получить пользователя';
    }
  }

  // TODO: why two similar methods??
  async getOne(id: number) {
    if(isNaN(id)) throw "Id must be number";
    return await User.findByPk(id, { include: [ { model: UserRole, include: [ RolePermission ] }, Group, UserSetting ] });
  }

  async registration (regDto: RegDTO) {
    
    const isUserExist = await User.findOne({ where: { email: regDto.email } });
    if (isUserExist) {
      throw `Такой пользователь уже зарегистрирован`;
    }

    const hashedPassword = await bcrypt.hash(regDto.password.trim(), 5);
    const role = regDto.role == 'mentor' ? await this.roleService.getMentorRole() : await this.roleService.getStudentRole();
    const group = await groupService.getByPK(regDto.groupId);
    
    if(!role) throw "Такой роли не существует"; // must have not to be here
    if(!group) throw "Такой группы не существует"; // must have not to be here

    const user = await User.create(
      {
        email: regDto.email.trim().toLowerCase(),
        password: hashedPassword,
        status: UserStatus.inReview,
        firstName: regDto.firstName.trim(),
        lastName: regDto.lastName.trim(),
        patronymic: regDto.patronymic.trim(),
        phone: regDto.phone,
        roleId: role.id,
        groupId: group.id,
        avatarUrl: '/_defaults/avatars/1.svg'
      },
      { returning: true, },
    );
    
    //TODO: send email to user
    
    const tokens = tokenService.generateTokens({ id: user.id, email: regDto.email, groupId: user!.groupId, permissions: role.permissions });
    await tokenService.saveToken(user.id, tokens.refreshToken);

    const createdUser = await User.findByPk(user.id, { attributes: { exclude: [ 'password' ] } , include: [ { model: UserRole, include: [ RolePermission ] }, Group, UserSetting ] });

    return { ...tokens, user: createdUser };
    
  }

  // TODO: include `role` in LoginDTO
  async login(loginDto: LoginDTO & { role?: 'admin' | 'student' | 'teacher' }) {
    const role = loginDto.role == 'admin' ?
      await this.roleService.getAdminRole() :
      loginDto.role == 'teacher' ?
        await this.roleService.getTeacherRole():
        await this.roleService.getStudentRoles();
    
    if(!role) throw "Такой роли не существует"; // must have not to be here

    const user = await User.findOne({ where: {
      email: loginDto.email.trim().toLowerCase(),
      roleId: loginDto.role == 'student' ? (role as UserRole[]).map(r => r.id) : (role as UserRole).id
    }, include: [ { model: UserRole, include: [ RolePermission ] }, Group, UserSetting ] });

    if (!user) throw 'Такой пользователь не зарегистрирован';
    const isPassEquals = await bcrypt.compare(loginDto.password, user.password);
    if (!isPassEquals) throw 'Неверный пароль';

    if (user.status == UserStatus.inReview && user.role.title == RoleNames.mentor) throw 'Ваш аккаунт еще не подтвердили. Пожалуйста, свяжитесь с администрацией';
    if (user.status == UserStatus.inReview) throw 'Ваш аккаунт еще не подтвердили. Пожалуйста, свяжитесь со старостой группы';
    if (user.status == UserStatus.rejected) throw 'Ваш аккаунт был отклонен. Пожалуйста, свяжитесь со старостой группы';
    
    const tokens = tokenService.generateTokens({ id: user.id, email: loginDto.email, groupId: user.groupId, permissions: { canEdit: user.role.permissions.canEdit, canInvite: user.role.permissions.canInvite } });

    await tokenService.saveToken(user.id, tokens.refreshToken);
    
    user.password = '';
    return { ...tokens, user };
  }

  async logout(refreshToken:string) {
    const token = await tokenService.removeToken(refreshToken);
    return token;
  }

  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw ApiError.unauthorizedError();
    }
    const userData = tokenService.validateRefreshToken(refreshToken);
    const tokenFromDb = await tokenService.findToken(refreshToken);
    // TODO: пока такой костыль. кажется небезопасно
    if (!userData /* || !tokenFromDb */) {
      throw ApiError.unauthorizedError();
    }
    const user = await User.findByPk(userData.id, { include: [ { model: UserRole, include: [ RolePermission ] }, Group, UserSetting ] });
    const tokens = tokenService.generateTokens({ id: user!.id, email: user!.email, groupId: user!.groupId, permissions: { canEdit: user!.role.permissions.canEdit, canInvite: user!.role.permissions.canInvite } });

    await tokenService.saveToken(user!.id, tokens.refreshToken);
    return { ...tokens, user: user! };
  }

  async update(dto: {
    avatarUrl: string;
    nickname: string;
    firstName: string;
    lastName: string;
    phone: string;
    avatarColor: string;
  }, userId: number) {
  
    const user = await User.findByPk(userId);
    const userSettings = await UserSetting.findOne({ where: { userId } });
    if (!user || !userSettings) throw 'Такой пользователь не найден';
    user.avatarUrl = dto.avatarUrl;
    user.nickname = dto.nickname;
    user.firstName = dto.firstName;
    user.lastName = dto.lastName;
    user.phone = dto.phone;
    userSettings.nickColor = dto.avatarColor;
    await userSettings.save();
    await user.save();

    const updatedUser = await User.findByPk(userId, { include: [ { model: UserRole, include: [ RolePermission ] }, Group, UserSetting ] });

    return updatedUser;
  }

  async passRecovery({ email }: {email: string}) {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw "Такого пользователя нет";
    }
    try {
      const { hash, expires } = await recoveryService.generateHashForPassRecovery(email);
      const recovery = await TemporaryLink.create({ hash, expires });
      const recoveryLink = `${process.env.FRONTEND_URL}/recovery?recoveryId=${recovery.id}&hash=${hash}&userId=${user.id}`;
      await mailService.sendMail(email, 'Восстановление пароля', mailRecoveryTemplate(recoveryLink));
      return { result: true };
    }
    catch(e) {
      console.log(e);
      throw "Произошла ошибка, свяжитесь с поддержкой";
    }
  }

  async passRecoveryUpdate ({ recoveryId, hash, password, userId }: ResetPasswordDTO) {
    const isCorrect = await recoveryService.checkPassRecoveryHash(recoveryId, hash);
    if(isCorrect) {
      const hashedNewPassword = await bcrypt.hash(password, 5);

      await User.update(
        { password: hashedNewPassword },
        { where: { id: Number(userId) }, returning: true },
      );
        
      TemporaryLink.destroy({ where: { hash } });
      return { result: true };
    }
  }

  /**
   * используется старостой
   * @param accountId - айдишники аккаунтов, который нужно принять/отклонить
   */
  async manageAccount (dto: {accounts: number[]; status: UserStatus} ) {
    try {
      await User.update({ status: dto.status }, { where: { id: dto.accounts } });
      return true;
    }
    catch(e) {
      console.log(e);
      throw 'Не удалось изменить статус аккаунта';
    }
  }

}

export default new UserService();