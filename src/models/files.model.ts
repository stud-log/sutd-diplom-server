import { BelongsTo, Column, DataType, ForeignKey, HasMany, HasOne, Model, Table } from 'sequelize-typescript';

import { Record } from './records.model';

interface FileAttrs {
  recordId: number;
  url: string;
  fileName: string;
  fileSize?: number;
}

/**
 * fileType это расширение
 * fileSize in bytes
 */
@Table({ tableName: 'Files' })
export class AppFiles extends Model<AppFiles, FileAttrs> {
  @Column({ primaryKey: true, allowNull: false, autoIncrement: true, unique: true })
  declare id: number;

  @ForeignKey(() => Record)
  @Column({ allowNull: false })
    recordId: number;
  
  @BelongsTo(() => Record)
    record: Record;

  @Column({ allowNull: false, type: DataType.TEXT })
    url: string;

  @Column({ allowNull: false, type: DataType.TEXT })
    fileName: string;

  @Column({ allowNull: true })
    fileSize: number;
}
