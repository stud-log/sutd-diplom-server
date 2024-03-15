import { LoginDTO, RegDTO } from '@stud-log/news-types/dto';
import { User, UserStatus } from "../models/user.model";

import { ApiError } from '../shared/error/ApiError';
import { GroupService } from "./group.service";
import { RolePermission } from "../models/role-permissions.model";
import { RoleService } from './role.service';
import { UserRole } from "../models/user-roles.model";
import bcrypt from 'bcryptjs';
import tokenService from './token.service';

export class UserService {
  private roleService = new RoleService();
  private groupService = new GroupService();

  async getAll() {
    return await User.findAll();
  }

  async getOne(id: number) {
    if(isNaN(id)) throw "Id must be number";
    return await User.findByPk(id);
  }

  registration = async (regDto: RegDTO) => {

    const isUserExist = await User.findOne({ where: { email: regDto.email } });
    if (isUserExist) {
      throw `Пользователь уже зарегистрирован (ID ${isUserExist.id})`;
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
      { returning: true },
    );
    
    //TODO: send email to user
    
    const tokens = tokenService.generateTokens({ id: user.id, email: regDto.email, permissions: role.permissions });
    await tokenService.saveToken(user.id, tokens.refreshToken);

    return { ...tokens, user };
   
  };

  async login(loginDto: LoginDTO) {
    const user = await User.findOne({ where: { email: loginDto.email }, include: [ { model: UserRole, include: [ RolePermission ] } ] });

    if (!user) throw 'Такой пользователь не зарегистрирован';
    const isPassEquals = await bcrypt.compare(loginDto.password, user.password);
    if (!isPassEquals) throw 'Неверный пароль';

    if (user.status == UserStatus.inReview) throw 'Ваш аккаунт еще не подтвердили. Пожалуйста, свяжитесь со старостой группы';
    if (user.status == UserStatus.rejected) throw 'Ваш аккаунт был отклонен. Пожалуйста, свяжитесь со старостой группы';

    const tokens = tokenService.generateTokens({ id: user.id, email: loginDto.email, permissions: user.role.permissions });

    await tokenService.saveToken(user.id, tokens.refreshToken);
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
    const user = await User.findByPk(userData.id);
    const tokens = tokenService.generateTokens({ id: user!.id, email: user!.email, permissions: user!.role.permissions });

    await tokenService.saveToken(user!.id, tokens.refreshToken);
    return { ...tokens, user: user! };
  }

}