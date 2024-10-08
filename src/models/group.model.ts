import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';

interface GroupAttrs {
  id?: number;
  name: string;
  visible?: boolean;
}

@Table({ tableName: 'Groups', createdAt: false, updatedAt: false })
export class Group extends Model<Group, GroupAttrs> {
  @Column({ primaryKey: true, allowNull: false, autoIncrement: true, unique: true })
    id: number;

  @Column({ allowNull: false })
    name: string;

  /**
   * May be used in ways when we need list of groups
   */
  @Column({ allowNull: true, defaultValue: true })
    visible: boolean;
}
