import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({ tableName: 'Achievements' })
export class Achievement extends Model<Achievement> {
  @Column({ primaryKey: true, allowNull: false, autoIncrement: true, unique: true })
    id: number;

  @Column({ allowNull: false })
    title: string;

  @Column(DataType.TEXT)
    description: string;

  @Column({ allowNull: false, type: DataType.TEXT })
    imgSrc: string;

  @Column(DataType.JSONB)
    condition: any;
}