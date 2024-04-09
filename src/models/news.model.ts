import { AfterCreate, BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';

import { Record } from './records.model';
import { User } from './user.model';

interface NewsAttrs {
  id?: number;
  authorId?: number;
  title: string;
  content: string;
  label?: string;
  coverImage?: string;
}

@Table({ tableName: 'News' })
export class News extends Model<News, NewsAttrs> {
  @Column({ primaryKey: true, allowNull: false, autoIncrement: true, unique: true })
    id: number;

  @ForeignKey(() => User)
  @Column({ allowNull: true })
    authorId: number;
  
  @BelongsTo(() => User)
    author: User;
    
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
    await Record.create({ recordTable: 'News', recordId: instance.id });
  }
}

