import { Column, Model, Table } from 'sequelize-typescript';

export enum AdminLevels {
  super = '1',
  high = '2',
  middle = '3',
  low = '4',
}

interface IAdmin {
  id?: number;
  fio?: string;
  login: string;
  password: string;
  accessLevel: AdminLevels;
}

/**
 * Для админов
 */
@Table({ tableName: 'admins' })
export class Admin extends Model<Admin, IAdmin> {
  @Column({ primaryKey: true, unique: true, allowNull: false, autoIncrement: true })
    id: number;

  @Column({ allowNull: true })
    fio: string;

  @Column({ comment: 'email / tel', allowNull: false })
    login: string;

  @Column({ allowNull: false })
    password: string;

  @Column({ values: Object.values(AdminLevels), allowNull: false })
    accessLevel: string;
}
