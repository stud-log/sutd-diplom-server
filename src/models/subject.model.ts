import { Column, Model, Table } from 'sequelize-typescript';

interface SubjectAttrs {
  id?: number;
  title: string;
  shortTitle?: string;
  teacherName?: string;
}

@Table({ tableName: 'Subjects', createdAt: false, updatedAt: false })
export class Subject extends Model<Subject, SubjectAttrs> {
  @Column({ primaryKey: true, allowNull: false, autoIncrement: true, unique: true })
  declare id: number;

  @Column({ allowNull: false })
    title: string;

  @Column({ allowNull: true })
    shortTitle: string;

  @Column({ allowNull: true })
    teacherName: string;

}
