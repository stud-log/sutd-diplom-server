import { AfterCreate, BelongsTo, Column, DataType, ForeignKey, HasMany, HasOne, Model, Table } from 'sequelize-typescript';

import { Group } from './group.model';
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
  groupId?: number;
  recordId?: number;
  status?: UserTaskStatus;
  title?: string;
  description?: string;
  trackedTime?: number;
  doneDate?: string;
  endDate?: string;
  startDate?: string;
  myRecordId?: number;
}

/**
 * -Может относиться как к записи (задаче), так и к пользователю
 * при создании должен быть указан либо пользователь либо запись
 * -Здесь находятся пользовательские задачи - домашние задания  + кастомные задачи
 * (кастомные задания могут быть в рамках треда - задач, на которые группа разбивает
 * задание, или в рамках собственных, индивидуальных) , которые пользователь начал\закончил выполнять.
 * -status in ['inProgress', 'feedback', 'passed'] (в процессе, ожидает фидбека, сдано)
 * -trackedTime (in ms) - время, потраченное на задачу (может отсутствовать, тогда будет взято время в промежутке от createdAt до doneAt)
 * -userId, при указанном recordId имеет смысл "исполнитель задачи"
 * -описание может быть не заполнено
 *
 * __NOTE__:
 * Если заполнены поля задачи, и указано recordId - это значит, что мы создали свою задачу рамках какой то record сущности. Предполагается, что в рамках сущности teams.
 * Если заполнено только recordId, значит мы просто взяли домашку в работу.
 * Если же задача полностью кастомная, то recordId вообще не будет.
 * Если заполнено parentId, то задача является зависимой от указанной задачи. parentId обязательно ссылается только на UserTask, чем бы он ни был
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

  @ForeignKey(() => Group)
  @Column({ allowNull: true })
    groupId: number;

  @BelongsTo(() => Group)
    group: Group;

  @ForeignKey(() => Record)
  @Column({ allowNull: true })
    myRecordId: number;
    
  @BelongsTo(() => Record, { as: 'myRecord', foreignKey: 'myRecordId' })
    myRecord: Record;
  
  @ForeignKey(() => Record)
  @Column({ allowNull: true })
    recordId: number;
    
  @BelongsTo(() => Record, { as: 'record', foreignKey: 'recordId' })
    record: Record;

  @Column({ allowNull: true })
    parentId: number;

  @Column({ allowNull: true })
    title: string;

  @Column({ allowNull: true })
    description: string;

  @Column({ allowNull: true })
    trackedTime: number;

  @Column({ allowNull: false, defaultValue: UserTaskStatus.inProgress })
    status: string;

  /** Когда задачу выполнили */
  @Column({ allowNull: true })
    doneDate: string;

  /**Начало  */
  @Column({ allowNull: true })
    startDate: string;

  /**Дедлайн  */
  @Column({ allowNull: true })
    endDate: string;

  @BelongsTo(() => UserTask, {
    as: 'parent',
    foreignKey: 'parentId',
    targetKey: 'id',
  })
    parent: UserTask;
  
  @HasMany(() => UserTask, {
    as: 'children',
    foreignKey: 'parentId',
  })
    children: UserTask[];

  @AfterCreate({})
  static async createRecord(instance: UserTask) {
    const record = await Record.create({ recordTable: 'UserTask', recordId: instance.id, groupId: instance.groupId });
    instance.myRecordId = record.id;
    await instance.save();
  }
}
