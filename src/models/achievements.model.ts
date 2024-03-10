import { Column, DataType, Model, Table } from 'sequelize-typescript';

interface AchievementAttrs {
  id?: number;
  title: string;
  description: string;
  imgSrc: string;
  condition: any;
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

  @Column({ type: DataType.JSONB })
    condition: any;
}