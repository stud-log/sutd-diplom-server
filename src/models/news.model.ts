import { AfterCreate, BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';

import { Group } from './group.model';
import { Record } from './records.model';
import { User } from './user.model';

interface NewsAttrs {
  id?: number;
  authorId?: number;
  groupId: number;
  title: string;
  content: string;
  label?: string;
  coverImage?: string | null;
}

@Table({ tableName: 'News' })
export class News extends Model<News, NewsAttrs> {
  @Column({ primaryKey: true, allowNull: false, autoIncrement: true, unique: true })
    id: number;

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

  @ForeignKey(() => Record)
  @Column({ allowNull: true })
    recordId: number;
  
  @BelongsTo(() => Record)
    record: Record;
    
  @Column({ allowNull: false })
    title: string;
    
  @Column({ allowNull: false, type: DataType.TEXT })
    content: string;

  @Column({ allowNull: true })
    label: string;

  @Column({ allowNull: true })
    coverImage: string;
    
  @AfterCreate({})
  static async createRecord(instance: News) {
    const record = await Record.create({ recordTable: 'News', recordId: instance.id, groupId: instance.groupId });
    instance.recordId = record.id;
    await instance.save();
  }
}

