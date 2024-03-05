import { BelongsTo, Column, DataType, ForeignKey, HasMany, HasOne, Model, Table } from 'sequelize-typescript';

import { Record } from './records.model';
import { User } from './user.model';

interface UserNotificationAttrs {
  id?: number;
  userId: number;
  recordId?: number;
  authorId: number;
  title: string;
  content: string;
  isSeen: boolean;
}

/**
 * Уведомление может иметь связь с записью. Например, что на комментарий пользователя ответили и т.п.
 * authorId по умолчанию принадлежит аккаунту системы
 */
@Table({ tableName: 'UserNotifications' })
export class UserNotification extends Model<UserNotification, UserNotificationAttrs> {
  @Column({ primaryKey: true, allowNull: false, autoIncrement: true, unique: true })
    id: number;

  @ForeignKey(() => User)
  @Column({ allowNull: false })
    userId: number;
  
  @BelongsTo(() => User)
    user: User;

  @ForeignKey(() => Record)
  @Column({ allowNull: true })
    recordId: number;
  
  @BelongsTo(() => Record)
    record: Record;

  @ForeignKey(() => User)
  @Column({ allowNull: false })
    authorId: number;
    
  @BelongsTo(() => User)
    author: User;

  @Column({ allowNull: false })
    title: string;

  @Column({ allowNull: true })
    content: string;

  @Column({ allowNull: false, defaultValue: false })
    isSeen: boolean;

}
