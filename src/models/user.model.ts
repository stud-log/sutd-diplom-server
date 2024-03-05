import { BelongsTo, BelongsToMany, Column, DataType, ForeignKey, HasMany, HasOne, Model, Table } from 'sequelize-typescript';

import { Group } from './group.model';
import { UserRole } from './user-roles.model';

export enum UserStatus {
  inReview = 'inReview',
  approved = 'approved',
  rejected = 'rejected',
}

interface UserAttrs {
  id?: number;
  roleId: number;
  groupId?: number;
  firstName: string;
  lastName: string;
  password: string;
  phone: string;
  status: UserStatus;
  avatarUrl?: string;
}

@Table({ tableName: 'Users' })
export class User extends Model<User, UserAttrs> {
  @Column({ primaryKey: true, unique: true, allowNull: false, autoIncrement: true })
    id: number;

  @ForeignKey(() => UserRole)
  @Column({ allowNull: false })
    roleId: number;

  @BelongsTo(() => UserRole)
    role: UserRole;

  @ForeignKey(() => Group)
  @Column({ allowNull: true })
    groupId: number;

  @BelongsTo(() => Group)
    group: Group;

  @Column({ allowNull: false })
    firstName: string;

  @Column({ allowNull: false })
    lastName: string;

  @Column({ allowNull: false })
    password: string;

  @Column({ allowNull: false })
    phone: string;

  @Column({ type: DataType.TEXT, allowNull: true })
    avatarUrl: string;

  @Column({ values: Object.values(UserStatus), allowNull: false })
    status: string;
  
}
