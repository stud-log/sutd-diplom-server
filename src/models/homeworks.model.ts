import { AfterCreate, BelongsTo, Column, DataType, ForeignKey, HasMany, Model, Table } from 'sequelize-typescript';

import { AppFiles } from './files.model';
import { Group } from './group.model';
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
  groupId: number;
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
  declare id: number;

  @ForeignKey(() => Record)
  @Column({ allowNull: true })
    recordId: number;
  
  @BelongsTo(() => Record)
    record: Record;

  @ForeignKey(() => Subject)
  @Column({ allowNull: false })
    subjectId: number;

  @BelongsTo(() => Subject)
    subject: Subject;

  @ForeignKey(() => Group)
  @Column({ allowNull: false })
    groupId: number;

  @BelongsTo(() => Group)
    group: Group;

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
    const record = await Record.create({ recordTable: 'Homework', recordId: instance.id, groupId: instance.groupId });
    instance.recordId = record.id;
    await instance.save();
  }
}

