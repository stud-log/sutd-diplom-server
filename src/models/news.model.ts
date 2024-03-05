import { AfterCreate, BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';

import { Record } from './records.model';

interface NewsAttrs {
  id?: number;
  title: string;
  content: string;
  label?: string;
}

@Table({ tableName: 'News' })
export class News extends Model<News, NewsAttrs> {
  @Column({ primaryKey: true, allowNull: false, autoIncrement: true, unique: true })
    id: number;
    
  @Column({ allowNull: false })
    title: string;
    
  @Column({ allowNull: false, type: DataType.TEXT })
    content: string;

  @Column({ allowNull: true })
    label: string;
    
  @AfterCreate({})
  static async createRecord(instance: News) {
    await Record.create({ recordTable: 'News', recordId: instance.id });
  }
}

