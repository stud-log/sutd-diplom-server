import { BelongsTo, Column, ForeignKey, Model, Table } from 'sequelize-typescript';

import { Record } from './records.model';
import { User } from './user.model';

interface UserViewAttrs {
  id?: number;
  userId: number;
  recordId: number;
}

@Table({ tableName: 'UserViews' })
export class UserView extends Model<UserView, UserViewAttrs> {
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
