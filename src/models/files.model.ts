import { BelongsTo, Column, DataType, ForeignKey, HasMany, HasOne, Model, Table } from 'sequelize-typescript';

import { Record } from './records.model';

interface FileAttrs {
  recordId: number;
  url: string;
  fileType: string;
  fileSize?: number;
}

/**
 * fileType это расширение
 * fileSize in bytes
 */
@Table({ tableName: 'Files' })
export class File extends Model<File, FileAttrs> {
  @Column({ primaryKey: true, allowNull: false, autoIncrement: true, unique: true })
    id: number;

  @ForeignKey(() => Record)
  @Column({ allowNull: false })
    recordId: number;
  
  @BelongsTo(() => Record)
    record: Record;

  @Column({ allowNull: false, type: DataType.TEXT })
    url: string;

  @Column({ allowNull: false })
    fileType: string;

  @Column({ allowNull: true })
    fileSize: number;
}
