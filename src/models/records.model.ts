import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';

import { Group } from './group.model';

interface RecordAttrs {
  recordTable: string;
  recordId: number;
  groupId: number;
}

@Table({ tableName: 'Records' })
export class Record extends Model<Record, RecordAttrs> {
  @Column({ primaryKey: true, allowNull: false, autoIncrement: true, unique: true })
    id: number;

  /**
   * Needed for easy identifying group the records relates to
   */
  @ForeignKey(() => Group)
  @Column({ allowNull: false })
    groupId: number;

  @BelongsTo(() => Group)
    group: Group;

  @Column({ allowNull: false })
    recordTable: string;

  @Column({ allowNull: false })
    recordId: number;
}
