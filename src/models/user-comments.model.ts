import { AfterCreate, BelongsTo, Column, DataType, ForeignKey, HasMany, HasOne, Model, Table } from 'sequelize-typescript';

import { Group } from './group.model';
import { Record } from './records.model';
import { User } from './user.model';

interface UserCommentAttrs {
  id?: number;
  userId: number;
  recordId: number;
  groupId: number;
  parentId?: number;
  replyToUserId?: number;
  title?: string;
  content: string;
  isNote: boolean;
  myRecordId: number;
}
/**
 * Комментарии пользователей
 * * title - опциональное поле, для комментариев официального типа
 * * isNote - если комментарий является заметкой для собственной задачи
 */
@Table({ tableName: 'UserComments' })
export class UserComment extends Model<UserComment, UserCommentAttrs> {
  @Column({ primaryKey: true, allowNull: false, autoIncrement: true, unique: true })
  declare id: number;

  @ForeignKey(() => User)
  @Column({ allowNull: false })
    userId: number; // author of the comment
  
  @BelongsTo(() => User)
    user: User;

  @ForeignKey(() => User)
  @Column({ allowNull: true })
    replyToUserId: number; // to which user we are replying

  @ForeignKey(() => Group)
  @Column({ allowNull: false })
    groupId: number;

  @BelongsTo(() => Group)
    group: Group;

  @ForeignKey(() => Record)
  @Column({ allowNull: false })
    myRecordId: number;
  
  @BelongsTo(() => Record, { as: 'myRecord', foreignKey: 'myRecordId' })
    myRecord: Record;

  @ForeignKey(() => Record)
  @Column({ allowNull: false })
    recordId: number;
  
  @BelongsTo(() => Record, { as: 'record', foreignKey: 'recordId' })
    record: Record;

  @Column({ allowNull: true })
    parentId: number; // parent comment. DOES NOT MEANT THAT WE REPLY TO PARENT.user ; wee can constraint maximum levels of comments using this separation

  @BelongsTo(() => UserComment, {
    as: 'parent',
    foreignKey: 'parentId',
    targetKey: 'id',
  })
    parent: UserComment;

  @HasMany(() => UserComment, {
    as: 'children',
    foreignKey: 'parentId',
  })
    children: UserComment[];

  @Column({ allowNull: true })
    title: string;

  @Column({ allowNull: false, type: DataType.TEXT })
    content: string;

  @Column({ allowNull: false, defaultValue: false })
    isNote: boolean;

  @AfterCreate({})
  static async createRecord(instance: UserComment) {
    const record = await Record.create({ recordTable: 'UserComment', recordId: instance.id, groupId: instance.groupId });
    instance.myRecordId = record.id;
    await instance.save();
  }
}
