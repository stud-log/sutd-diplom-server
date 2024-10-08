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
import { Subject } from './subject.model';

export enum UserStatus {
  inReview = 'inReview',
  approved = 'approved',
  rejected = 'rejected',
  deleted = 'deleted'
}

interface UserAttrs {
  id?: number;
  roleId: number;
  groupId?: number;
  firstName: string;
  lastName: string;
  patronymic?: string; // отчество
  nickname?: string | null;
  email: string;
  password?: string;
  phone?: string;
  status: UserStatus;
  avatarUrl?: string;
  createdFromAdminPanel?: boolean;
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

  /**
   * If user is a Teacher
   */
  @HasMany(() => Subject)
    subjects: Subject[];

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

  @Column({ allowNull: true })
    password: string;

  @Column({ allowNull: true })
    phone: string;

  @Column({ type: DataType.TEXT, allowNull: true })
    avatarUrl: string;

  @Column({ values: Object.values(UserStatus), allowNull: false })
    status: string;

  @Column({ allowNull: true, defaultValue: false })
    createdFromAdminPanel: boolean;
  
  @AfterCreate({})
  static async createRecord(instance: User) {
    await UserSetting.create({ userId: instance.id });
  }
}
