import { RoleCreationDTO } from "@stud-log/news-types/dto";
import { RolePermission } from "../models/role-permissions.model";
import { UserRole } from "../models/user-roles.model";

export enum RoleNames {
  student = 'Студент',
  mentor = 'Староста',
  teacher = 'Преподаватель',
  admin = 'Администратор',
  superAdmin = 'Главный администратор',
}

class RoleService {

  async getAll() {
    return await UserRole.findAll();
  }

  async getStudentRole() {
    return await UserRole.findOne({ where: { title: RoleNames.student }, include: [ RolePermission ] });
  }

  async getMentorRole() {
    return await UserRole.findOne({ where: { title: RoleNames.mentor }, include: [ RolePermission ] });
  }

  /**
   * Returns roles that corresponding to students: mentor and student
   */
  async getStudentRoles() {
    return await UserRole.findAll({ where: { title: [ RoleNames.student, RoleNames.mentor ] }, include: [ RolePermission ] });
  }

  async getTeacherRole() {
    return await UserRole.findOne({ where: { title: RoleNames.teacher }, include: [ RolePermission ] });
  }

  /**
   * Returns roles that corresponding to teachers: teachers
   */
  async getTeacherRoles() {
    return await UserRole.findAll({ where: { title: [ RoleNames.teacher ] }, include: [ RolePermission ] });
  }

  async getAdminRole() {
    return await UserRole.findOne({ where: { title: RoleNames.admin }, include: [ RolePermission ] });
  }

  async getSuperAdminRole() {
    return await UserRole.findOne({ where: { title: RoleNames.superAdmin }, include: [ RolePermission ] });
  }

  /**
   * Returns roles that corresponding to admins: admin and superAdmins
   */
  async getAdminRoles() {
    return await UserRole.findAll({ where: { title: [ RoleNames.admin, RoleNames.superAdmin ] }, include: [ RolePermission ] });
  }

  async create(roleCreateDTO: RoleCreationDTO) {
    const isRoleExist = await UserRole.findOne({ where: { title: roleCreateDTO.title } });
    if (isRoleExist) {
      throw `Такая роль уже существует`;
    }
    const role = await UserRole.create({ title: roleCreateDTO.title });
    await this.createPermissions(role.id, roleCreateDTO.permissions);

    return role;
  }

  async createPermissions(roleId: number, permissions: RoleCreationDTO['permissions'] ) {
    return await RolePermission.create({ roleId, ...permissions });
  }

}

export default new RoleService();