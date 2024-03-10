import { AfterCreate, BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';

import { Record } from './records.model';

export enum HomeworkType {
  individual = 'individual',
  group = 'group'
}

interface HomeworkAttrs {
  id?: number;
  title: string;
  content: string;
  deadline: string;
  type: HomeworkType;
}

@Table({ tableName: 'Homeworks' })
export class Homework extends Model<Homework, HomeworkAttrs> {
  @Column({ primaryKey: true, allowNull: false, autoIncrement: true, unique: true })
    id: number;
    
  @Column({ allowNull: false })
    title: string;
    
  @Column({ allowNull: false, type: DataType.TEXT })
    content: string;

  @Column({ allowNull: false })
    deadline: string;

  @Column({ allowNull: false })
    type: string;
    
  @AfterCreate({})
  static async createRecord(instance: Homework) {
    await Record.create({ recordTable: 'Homework', recordId: instance.id });
  }
}

