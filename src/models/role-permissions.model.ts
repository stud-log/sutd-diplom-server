import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';

import { UserRole } from './user-roles.model';

interface RolePermissionAttrs {
  id?: number;
  canEdit: boolean;
  canInvite: boolean;
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

  @Column({ allowNull: false })
    canEdit: boolean;

  @Column({ allowNull: false })
    canInvite: boolean;

  @ForeignKey(() => UserRole)
  @Column({ allowNull: false })
    roleId: number;
    
  @BelongsTo(() => UserRole)
    role: UserRole;
  
}
