import { BelongsTo, Column, DataType, ForeignKey, HasMany, HasOne, Model, Table } from 'sequelize-typescript';

import { RolePermission } from './role-permissions.model';
import { User } from './user.model';

interface UserRoleAttrs {
  id?: number;
  title: string;
}

@Table({ tableName: 'UserRoles' })
export class UserRole extends Model<UserRole, UserRoleAttrs> {
  @Column({ primaryKey: true, allowNull: false, autoIncrement: true, unique: true })
    id: number;

  @Column({ allowNull: false })
    title: string;

  @HasMany(() => User)
    users: User[];

  @HasOne(() => RolePermission)
    permissions: RolePermission;

}
