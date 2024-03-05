import { AfterCreate, BelongsTo, Column, DataType, ForeignKey, HasMany, Model, Table } from 'sequelize-typescript';

import { Record } from './records.model';

interface SubjectAttrs {
  id?: number;
  title: string;
  shortTitle?: string;
  teacherName?: string;
}

@Table({ tableName: 'Subjects', createdAt: false, updatedAt: false })
export class Subject extends Model<Subject, SubjectAttrs> {
  @Column({ primaryKey: true, allowNull: false, autoIncrement: true, unique: true })
    id: number;

  @Column({ allowNull: false })
    title: string;

  @Column({ allowNull: true })
    shortTitle: string;

  @Column({ allowNull: true })
    teacherName: string;

  @AfterCreate({})
  static async createRecord(instance: Subject) {
    await Record.create({ recordTable: 'User', recordId: instance.id });
  }
}
