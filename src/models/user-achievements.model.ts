import { BelongsTo, Column, DataType, ForeignKey, HasMany, HasOne, Model, Table } from 'sequelize-typescript';

import { Achievement } from './achievements.model';
import { User } from './user.model';

interface UserAchievementAttrs {
  id?: number;
  userId: number;
  achievementId: number;
}

@Table({ tableName: 'UserAchievements' })
export class UserAchievement extends Model<UserAchievement, UserAchievementAttrs> {
  @Column({ primaryKey: true, allowNull: false, autoIncrement: true, unique: true })
  declare id: number;

  @ForeignKey(() => User)
  @Column({ allowNull: false })
    userId: number;
  
  @BelongsTo(() => User)
    user: User;

  @ForeignKey(() => Achievement)
  @Column({ allowNull: false })
    achievementId: number;
  
  @BelongsTo(() => Achievement)
    achievement: Achievement;

}
