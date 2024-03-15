import { RoleCreationDTO } from "@stud-log/news-types/dto";
import { RolePermission } from "../models/role-permissions.model";
import { UserRole } from "../models/user-roles.model";

export class RoleService {

  async getAll() {
    return await UserRole.findAll();
  }

  async getStudentRole() {
    return await UserRole.findOne({ where: { title: "Студент" }, include: [ RolePermission ] });
  }

  async getMentorRole() {
    return await UserRole.findOne({ where: { title: "Староста" }, include: [ RolePermission ] });
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