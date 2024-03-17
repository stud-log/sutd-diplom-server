import { LoginDTO, RegDTO, ResetPasswordDTO } from '@stud-log/news-types/dto';
import { User, UserStatus } from "../models/user.model";

import { ApiError } from '../shared/error/ApiError';
import { Group } from '../models/group.model';
import { GroupService } from "./group.service";
import { RolePermission } from "../models/role-permissions.model";
import { RoleService } from './role.service';
import { TemporaryLink } from '../models/tmp-links.model';
import { UserRole } from "../models/user-roles.model";
import bcrypt from 'bcryptjs';
import { mailRecoveryTemplate } from '../shared/templates/mail/recovery.template';
import mailService from './mail.service';
import recoveryService from './recovery.service';
import tokenService from './token.service';

class UserService {
  private roleService = new RoleService();
  private groupService = new GroupService();

  async getAll() {
    return await User.findAll();
  }

  async getMe(id: number) {
    return await User.findByPk(id, { include: [ { model: UserRole, include: [ RolePermission ] }, Group ] });
  }

  async getOne(id: number) {
    if(isNaN(id)) throw "Id must be number";
    return await User.findByPk(id);
  }

  async registration (regDto: RegDTO) {
    
    const isUserExist = await User.findOne({ where: { email: regDto.email } });
    if (isUserExist) {
      throw `Такой пользователь уже зарегистрирован`;
    }

    const hashedPassword = await bcrypt.hash(regDto.password.trim(), 5);
    const role = regDto.role == 'mentor' ? await this.roleService.getMentorRole() : await this.roleService.getStudentRole();
    const group = await this.groupService.getByName(regDto.group);
    
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
        groupId: group.id
      },
      { returning: true, },
    );
    
    //TODO: send email to user
    
    const tokens = tokenService.generateTokens({ id: user.id, email: regDto.email, permissions: role.permissions });
    await tokenService.saveToken(user.id, tokens.refreshToken);

    const createdUser = await User.findByPk(user.id, { attributes: { exclude: [ 'password' ] } , include: [ { model: UserRole, include: [ RolePermission ] }, Group ] });

    return { ...tokens, user: createdUser };
    
  }

  async login(loginDto: LoginDTO) {
    const user = await User.findOne({ where: { email: loginDto.email.trim().toLowerCase() }, include: [ { model: UserRole, include: [ RolePermission ] }, Group ] });

    if (!user) throw 'Такой пользователь не зарегистрирован';
    const isPassEquals = await bcrypt.compare(loginDto.password, user.password);
    if (!isPassEquals) throw 'Неверный пароль';

    if (user.status == UserStatus.inReview && user.role.title == 'Староста') throw 'Ваш аккаунт еще не подтвердили. Пожалуйста, свяжитесь с администрацией';
    if (user.status == UserStatus.inReview) throw 'Ваш аккаунт еще не подтвердили. Пожалуйста, свяжитесь со старостой группы';
    if (user.status == UserStatus.rejected) throw 'Ваш аккаунт был отклонен. Пожалуйста, свяжитесь со старостой группы';
    
    const tokens = tokenService.generateTokens({ id: user.id, email: loginDto.email, permissions: { canEdit: user.role.permissions.canEdit, canInvite: user.role.permissions.canInvite } });

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
    if (!userData || !tokenFromDb) {
      throw ApiError.unauthorizedError();
    }
    const user = await User.findByPk(userData.id, { include: [ { model: UserRole, include: [ RolePermission ] }, Group ] });
    const tokens = tokenService.generateTokens({ id: user!.id, email: user!.email, permissions: { canEdit: user!.role.permissions.canEdit, canInvite: user!.role.permissions.canInvite } });

    await tokenService.saveToken(user!.id, tokens.refreshToken);
    return { ...tokens, user: user! };
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

}

export default new UserService();