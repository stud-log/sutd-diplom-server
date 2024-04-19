import { BelongsTo, Column, DataType, ForeignKey, HasMany, HasOne, Model, Table } from 'sequelize-typescript';

import { Record } from './records.model';
import { User } from './user.model';

interface UserReactionAttrs {
  id?: number;
  userId: number;
  recordId: number;
  type: string;
  imageUrl?: string;
}

@Table({ tableName: 'UserReactions' })
export class UserReaction extends Model<UserReaction, UserReactionAttrs> {
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

  @Column({ allowNull: false })
    type: string;

  @Column({ allowNull: true, type: DataType.TEXT })
    imageUrl: string;

}
