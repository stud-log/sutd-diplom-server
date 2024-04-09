import { AfterCreate, BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';

import { Record } from './records.model';
import { Subject } from './subject.model';
import { User } from './user.model';

export enum HomeworkType {
  individual = 'individual',
  group = 'group'
}

interface HomeworkAttrs {
  id?: number;
  authorId?: number;
  title: string;
  content: string;
  startDate: string;
  subjectId: number;
  endDate: string;
  type: HomeworkType;
}

@Table({ tableName: 'Homeworks' })
export class Homework extends Model<Homework, HomeworkAttrs> {
  @Column({ primaryKey: true, allowNull: false, autoIncrement: true, unique: true })
    id: number;

  @ForeignKey(() => Subject)
  @Column({ allowNull: false })
    subjectId: number;

  @BelongsTo(() => Subject)
    subject: Subject;

  @ForeignKey(() => User)
  @Column({ allowNull: true })
    authorId: number;
  
  @BelongsTo(() => User)
    author: User;
    
  @Column({ allowNull: false })
    title: string;
    
  @Column({ allowNull: false, type: DataType.TEXT })
    content: string;

  @Column({ allowNull: false })
    startDate: string;

  @Column({ allowNull: false })
    endDate: string;

  @Column({ allowNull: false })
    type: string;
    
  @AfterCreate({})
  static async createRecord(instance: Homework) {
    await Record.create({ recordTable: 'Homework', recordId: instance.id });
  }
}

