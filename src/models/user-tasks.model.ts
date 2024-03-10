import { BelongsTo, Column, DataType, ForeignKey, HasMany, HasOne, Model, Table } from 'sequelize-typescript';

import { Record } from './records.model';
import { User } from './user.model';

export enum UserTaskStatus {
  inProgress = 'inProgress',
  feedback = 'feedback',
  passed = 'passed',
}

interface UserTaskAttrs {
  id?: number;
  userId?: number;
  recordId?: number;
  status: UserTaskStatus;
  title: string;
  description?: string;
  trackedTime?: number;
  doneDate: string;
}

/**
 * Может относиться как к записи (задаче), так и к пользователю
 * при создании должен быть указан либо пользователь либо запись
 * Здесь находятся пользовательские задачи - домашние задания  + кастомные задачи
 * (кастомные задания могут быть в рамках треда - задач, на которые группа разбивает
 * задание, или в рамках собственных, индивидуальных) , которые пользователь начал\закончил выполнять.
 * status in ['inProgress', 'feedback', 'passed'] (в процессе, ожидает фидбека, сдано)
 * trackedTime (in ms) - время, потраченное на задачу (может отсутствовать, тогда будет взято время в промежутке от createdAt до doneAt)
 * userId, при указанном recordId имеет смысл "исполнитель задачи"
 * описание может быть не заполнено
 *
 */
@Table({ tableName: 'UserTasks' })
export class UserTask extends Model<UserTask, UserTaskAttrs> {
  @Column({ primaryKey: true, allowNull: false, autoIncrement: true, unique: true })
    id: number;

  @ForeignKey(() => User)
  @Column({ allowNull: true })
    userId: number;
  
  @BelongsTo(() => User)
    user: User;

  @ForeignKey(() => Record)
  @Column({ allowNull: true })
    recordId: number;
  
  @BelongsTo(() => Record)
    record: Record;

  @Column({ allowNull: false })
    title: string;

  @Column({ allowNull: true })
    description: string;

  @Column({ allowNull: true })
    trackedTime: number;

  @Column({ allowNull: false })
    status: string;

  @Column({ allowNull: false })
    doneDate: string;

}
