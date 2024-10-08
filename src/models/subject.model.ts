import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { User } from './user.model';

interface SubjectAttrs {
  id?: number;
  title: string;
  shortTitle?: string;
  teacherName?: string;
  userId?: number | null;
}

@Table({ tableName: 'Subjects', createdAt: false, updatedAt: false })
export class Subject extends Model<Subject, SubjectAttrs> {
  @Column({ primaryKey: true, allowNull: false, autoIncrement: true, unique: true })
    id: number;

  @Column({ allowNull: false })
    title: string;

  @Column({ allowNull: true })
    shortTitle: string;

  /**
   * Здесь имя препода, которое спарсилось из таблички
   */
  @Column({ allowNull: true })
    teacherName: string;

  /**
   * Аккаунт преподавателя
   */
  @ForeignKey(() => User)
  @Column({ allowNull: true, type: DataType.NUMBER })
    userId: number | null;
    
  @BelongsTo(() => User)
    teacher: User;

}
