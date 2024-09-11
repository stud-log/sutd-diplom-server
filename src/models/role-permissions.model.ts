import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';

import { UserRole } from './user-roles.model';

interface RolePermissionAttrs {
  id?: number;
  canEdit?: boolean;
  canInvite?: boolean;
  aTeacher?: boolean;
  anAdmin?: boolean;
  canSendPostsToTeachers?: boolean;
  canSendNewsToTeachers?: boolean;
  roleId: number;
}

/**
 * Может показаться излишним, так как в нашем приложении всего две роли - "Студент" и "Староста".
 * Однако, за расширением приложения могут быть добавлены новые роли и новые разрешения.
 * Потенциально - роль "Редактор", который например не сможет отправлять приглашения,
 * но сможет редактировать и добавлять посты.
 */
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

  @ForeignKey(() => UserRole)
  @Column({ allowNull: false })
    roleId: number;
    
  @BelongsTo(() => UserRole)
    role: UserRole;
  
}
