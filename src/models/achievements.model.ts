import { Column, DataType, Model, Table } from 'sequelize-typescript';

import { Log } from './logs.model';
import { Op } from 'sequelize';

export interface AchievementAttrs {
  id?: number;
  title: string;
  description: string;
  imgSrc: string;
  condition: any;
  trophy: any;
}
@Table({ tableName: 'Achievements' })
export class Achievement extends Model<Achievement, AchievementAttrs> {
  @Column({ primaryKey: true, allowNull: false, autoIncrement: true, unique: true })
    id: number;

  @Column({ allowNull: false })
    title: string;

  @Column({ allowNull: false, type: DataType.TEXT })
    description: string;

  @Column({ allowNull: false, type: DataType.TEXT })
    imgSrc: string;

  @Column({ type: DataType.JSONB, allowNull: true })
    condition: any; // condition keys must be same as log type

  @Column({ type: DataType.JSONB, allowNull: true })
    trophy: any;

  public progress: number;
  getProgress: (userId: number) => Promise<number>;

  static async findAllWithProgress(userId: number): Promise<Achievement[]> {
    const achievements = await this.findAll();

    // Calculate progress for each achievement
    await Promise.all(achievements.map(async (achievement) => {
      achievement.progress = await achievement.getProgress(userId);
    }));

    return achievements;
  }

}

Achievement.prototype.getProgress = async function (userId: number) {
  const conditionKeys = Object.keys(this.condition);
  const logTypeCondition = {
    [Op.or]: conditionKeys.map(key => ({ type: key }))
  };
  const logCount = await Log.count({
    where: {
      [Op.and]: [
        logTypeCondition,
        { userId: userId }
      ]
    }
  });
  const totalCount = conditionKeys.reduce((acc, current) => this.condition[current] + acc, 0); // суммируем все значения условий
  return Math.min((totalCount > 0 ? logCount / totalCount : 0) * 100, 100);
};