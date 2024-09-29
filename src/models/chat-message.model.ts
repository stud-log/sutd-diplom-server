import { AfterCreate, BelongsTo, Column, DataType, ForeignKey, HasMany, Model, Table } from 'sequelize-typescript';

import { User } from './user.model';

interface ChatMessageAttrs {
  id?: number;
  pinnedCommentId?: number;
  title: string;
  description?: string;
  groupId: number;
}

@Table({ tableName: 'ChatMessages' })
export class ChatMessage extends Model<ChatMessage, ChatMessageAttrs> {
  @Column({ primaryKey: true, allowNull: false, autoIncrement: true, unique: true })
    id: number;
  
}

