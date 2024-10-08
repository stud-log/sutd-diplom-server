import { AfterCreate, BelongsTo, Column, DataType, ForeignKey, HasMany, Model, Table } from 'sequelize-typescript';

import { User } from './user.model';

interface ChatAttrs {
  id?: number;
  pinnedCommentId?: number;
  title: string;
  description?: string;
  groupId: number;
}

@Table({ tableName: 'Chats' })
export class Chat extends Model<Chat, ChatAttrs> {
  @Column({ primaryKey: true, allowNull: false, autoIncrement: true, unique: true })
    id: number;

  @Column({ allowNull: false, type: DataType.ARRAY(DataType.INTEGER) })
    members: number[];
}

