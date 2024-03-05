import { BelongsTo, Column, DataType, ForeignKey, HasMany, HasOne, Model, Table } from 'sequelize-typescript';

import { Record } from './records.model';
import { User } from './user.model';

interface UserTeamAttrs {
  id?: number;
  userId: number;
  recordId: number;
  isOwner: boolean;
}

/**
 * По сути список принадлежности пользователя к группе (которая находит отражение в таблице Record)
 */
@Table({ tableName: 'UserTeams' })
export class UserTeam extends Model<UserTeam, UserTeamAttrs> {
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
    isOwner: boolean;

}
