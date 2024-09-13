import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';

import { UserRole } from './user-roles.model';

interface RolePermissionAttrs extends RolePermissions{
  id?: number;
  roleId: number;
}

export interface RolePermissions {
  canEdit?: boolean;
  canInvite?: boolean;
  aTeacher?: boolean;
  anAdmin?: boolean;
  canSendPostsToTeachers?: boolean;
  canSendNewsToTeachers?: boolean;
  canManageUsers?: boolean;
}

@Table({ tableName: 'RolePermissions' })
export class RolePermission extends Model<RolePermission, RolePermissionAttrs> {
  @Column({ primaryKey: true, allowNull: false, autoIncrement: true, unique: true })
    id: number;

  @Column({ allowNull: true, defaultValue: false })
    canEdit: boolean;

  @Column({ allowNull: true, defaultValue: false })
    canInvite: boolean;

  @Column({ allowNull: true, defaultValue: false })
    aTeacher: boolean;

  @Column({ allowNull: true, defaultValue: false })
    anAdmin: boolean;

  @Column({ allowNull: true, defaultValue: false })
    canSendPostsToTeachers: boolean;

  @Column({ allowNull: true, defaultValue: false })
    canSendNewsToTeachers: boolean;

  @Column({ allowNull: true, defaultValue: false })
    canManageUsers: boolean;

  @ForeignKey(() => UserRole)
  @Column({ allowNull: false })
    roleId: number;
    
  @BelongsTo(() => UserRole)
    role: UserRole;
  
}
