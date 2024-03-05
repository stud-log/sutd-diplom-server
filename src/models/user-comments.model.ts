import { AfterCreate, BelongsTo, Column, DataType, ForeignKey, HasMany, HasOne, Model, Table } from 'sequelize-typescript';

import { Record } from './records.model';
import { User } from './user.model';

interface UserCommentAttrs {
  id?: number;
  userId: number;
  recordId: number;
  parentId?: number;
  title?: string;
  content: string;
  isNote: boolean;
}
/**
 * Комментарии пользователей
 * * title - опциональное поле, для комментариев официального типа
 * * isNote - ?
 */
@Table({ tableName: 'UserComments' })
export class UserComment extends Model<UserComment, UserCommentAttrs> {
  @Column({ primaryKey: true, allowNull: false, autoIncrement: true, unique: true })
    id: number;

  @ForeignKey(() => User)
  @Column({ allowNull: false })
    userId: number;
  
  @BelongsTo(() => User)
    user: User;

  @ForeignKey(() => Record)
  @Column({ allowNull: false })
    recordId: number;
  
  @BelongsTo(() => Record)
    record: Record;

  @Column({ allowNull: true })
    parentId: number;

  @Column({ allowNull: true })
    title: string;

  @Column({ allowNull: false, type: DataType.TEXT })
    content: string;

  @Column({ allowNull: false, defaultValue: false })
    isNote: boolean;

  @AfterCreate({})
  static async createRecord(instance: UserComment) {
    await Record.create({ recordTable: 'UserComment', recordId: instance.id });
  }
}
