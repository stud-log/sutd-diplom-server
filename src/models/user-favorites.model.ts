import { BelongsTo, Column, DataType, ForeignKey, HasMany, HasOne, Model, Table } from 'sequelize-typescript';

import { Record } from './records.model';
import { User } from './user.model';

interface UserFavoriteAttrs {
  id?: number;
  userId: number;
  recordId: number;
}

@Table({ tableName: 'UserFavorites' })
export class UserFavorite extends Model<UserFavorite, UserFavoriteAttrs> {
  @Column({ primaryKey: true, allowNull: false, autoIncrement: true, unique: true })
  declare id: number;

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

}
