import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';

interface RecordAttrs {
  recordTable: string;
  recordId: number;

}

@Table({ tableName: 'Records' })
export class Record extends Model<Record, RecordAttrs> {
  @Column({ primaryKey: true, allowNull: false, autoIncrement: true, unique: true })
    id: number;

  @Column({ allowNull: false })
    recordTable: string;

  @Column({ allowNull: false })
    recordId: number;
}
