import { Achievement } from "../../models/achievements.model";
import { Group } from "../../models/group.model";
import { RolePermission } from "../../models/role-permissions.model";
import { UserRole } from "../../models/user-roles.model";
import { User, UserStatus } from "../../models/user.model";
import { RoleNames } from "../../services/role.service";
import { updateOrCreate } from "../utils/updateOrCreate";
import { defaultAchievements } from "./achievements";

export const createDefaultRecords = async () => {
  /**
     * Create default roles:
     * 1. Student
     * 2. Mentor - with permissions to CRUD news and homeworks in group
     * 3. Teacher - with permissions to CRUD news and homeworks to many groups
     * 4. Administrator - with access to admin.studlog.ru service and permissions to CRUD almost all information
     */
    
  const [ studentRole ] = await UserRole.findOrCreate({ where: { title: RoleNames.student }, defaults: { title: RoleNames.student } });
  await RolePermission.findOrCreate({ where: { roleId: studentRole.id }, defaults: { roleId: studentRole.id, canEdit: false, canInvite: false } });
  
  const [ mentorRole ] = await UserRole.findOrCreate({ where: { title: RoleNames.mentor }, defaults: { title: RoleNames.mentor } });
  await RolePermission.findOrCreate({ where: { roleId: mentorRole.id }, defaults: { roleId: mentorRole.id, canEdit: true, canInvite: true } });
    
  const [ teacherRole ] = await UserRole.findOrCreate({ where: { title: RoleNames.teacher }, defaults: { title: RoleNames.teacher } });
  await RolePermission.findOrCreate({ where: { roleId: teacherRole.id }, defaults: { roleId: teacherRole.id, canEdit: true, aTeacher: true } });
  
  const [ adminRole ] = await UserRole.findOrCreate({ where: { title: RoleNames.admin }, defaults: { title: RoleNames.admin } });
  await RolePermission.findOrCreate({ where: { roleId: adminRole.id }, defaults: { roleId: adminRole.id, canEdit: true, anAdmin: true, canSendNewsToTeachers: true, canSendPostsToTeachers: true } });
  
  const [ superAdminRole ] = await UserRole.findOrCreate({ where: { title: RoleNames.superAdmin }, defaults: { title: RoleNames.superAdmin } });
  await RolePermission.findOrCreate({ where: { roleId: superAdminRole.id }, defaults: { roleId: superAdminRole.id, canEdit: true, anAdmin: true, canSendNewsToTeachers: true, canSendPostsToTeachers: true, canManageUsers: true } });
  
  /** Create default achievements */
    
  await Promise.all(defaultAchievements.map(async (achievement) => {
    return updateOrCreate(Achievement, { where: { title: achievement.title }, defaults: { ...achievement } });
  }));
  
  /** Create system account */
  
  const [ systemGroup ] = await Group.findOrCreate({ where: { name: "Stud.log", visible: false }, defaults: { name: "Stud.log", visible: false } });
  const systemAcc = await User.findOne({ where: { lastName: 'Stud.log' } });
  if(!systemAcc) {
    await User.create({
      firstName: "",
      lastName: 'Stud.log',
      roleId: mentorRole.id,
      groupId: systemGroup.id,
      email: 'studlog.help@yandex.ru',
      phone: '+79657514079',
      avatarUrl: '/_defaults/avatars/logo.svg',
      password: '$2y$05$kIA.9TpSju4.5lxJ5MVL1uQmUE6OcqX8.HqMU4nAzMrkqbRfZ2Po6', // same as fastpanel password
      status: UserStatus.approved
    });
  }

  /** Create teachers group */
  
  const [ teachersGroup ] = await Group.findOrCreate({ where: { name: "Преподаватели", visible: false }, defaults: { name: "Преподаватели", visible: false } });
  
  /** Create teachers group */
  
  const [ adminsGroup ] = await Group.findOrCreate({ where: { name: "Администрация", visible: false }, defaults: { name: "Администрация", visible: false } });
  
  /** Create super admin account */
  
  const adminAcc = await User.findOne({ where: { firstName: 'Администрация', lastName: 'Stud.log' } });
  if(!adminAcc) {
    await User.create({
      firstName: "Администрация",
      lastName: 'Stud.log',
      roleId: superAdminRole.id,
      email: 'studlog@admin.ru',
      phone: '+79657514079',
      avatarUrl: '/_defaults/avatars/logo.svg',
      password: '$2y$05$kIA.9TpSju4.5lxJ5MVL1uQmUE6OcqX8.HqMU4nAzMrkqbRfZ2Po6', // same as fastpanel password
      status: UserStatus.approved
    });
  }
    
};