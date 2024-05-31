import { AfterCreate, BelongsTo, BelongsToMany, Column, DataType, ForeignKey, HasMany, HasOne, Model, Table } from 'sequelize-typescript';

import { Group } from './group.model';
import { Log } from './logs.model';
import { UserAchievement } from './user-achievements.model';
import { UserAttendance } from './user-attendance.model';
import { UserComment } from './user-comments.model';
import { UserFavorite } from './user-favorites.model';
import { UserNotification } from './user-notifications.model';
import { UserRole } from './user-roles.model';
import { UserSetting } from './user-settings.model';
import { UserTask } from './user-tasks.model';
import { UserTeam } from './user-teams.model';

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
  patronymic?: string; // отчество
  nickname?: string; // отчество
  email: string;
  password: string;
  phone: string;
  status: UserStatus;
  avatarUrl?: string;
}

@Table({ tableName: 'Users' })
export class User extends Model<User, UserAttrs> {
  @Column({ primaryKey: true, unique: true, allowNull: false, autoIncrement: true })
  declare id: number;

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

  @HasOne(() => UserSetting)
    settings: UserSetting;

  @HasMany(() => UserComment)
    comments: UserComment[];
  
  @HasMany(() => UserAttendance)
    attendances: UserAttendance[];

  @HasMany(() => UserFavorite)
    favorites: UserFavorite[];

  @HasMany(() => UserNotification)
    notifications: UserNotification[];

  @HasMany(() => UserTask)
    tasks: UserTask[];

  @HasMany(() => UserTeam)
    teams: UserTeam[];

  @HasMany(() => UserAchievement)
    achievements: UserAchievement[];

  @HasMany(() => Log)
    logs: Log[];

  @Column({ allowNull: true })
    nickname: string;

  @Column({ allowNull: false })
    firstName: string;

  @Column({ allowNull: false })
    lastName: string;

  @Column({ allowNull: true })
    patronymic: string;

  @Column({ allowNull: false })
    email: string;

  @Column({ allowNull: false })
    password: string;

  @Column({ allowNull: false })
    phone: string;

  @Column({ type: DataType.TEXT, allowNull: true })
    avatarUrl: string;

  @Column({ values: Object.values(UserStatus), allowNull: false })
    status: string;
  
  @AfterCreate({})
  static async createRecord(instance: User) {
    await UserSetting.create({ userId: instance.id });
  }
}
