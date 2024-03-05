import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';

interface GroupAttrs {
  id?: number;
  name: string;
}

@Table({ tableName: 'Groups', createdAt: false, updatedAt: false })
export class Group extends Model<Group, GroupAttrs> {
  @Column({ primaryKey: true, allowNull: false, autoIncrement: true, unique: true })
    id: number;

  @Column({ allowNull: false })
    name: string;
}
