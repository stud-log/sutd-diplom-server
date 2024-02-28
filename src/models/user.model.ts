import { BelongsToMany, Column, DataType, HasMany, HasOne, Model, Table } from 'sequelize-typescript';

@Table({ tableName: 'users' })
export class User extends Model<User, IUser> {
  @Column({ primaryKey: true, unique: true, allowNull: false, autoIncrement: true })
    id: number;

  @Column({ allowNull: false })
    firstName: string;

  @Column({ allowNull: false })
    lastName: string;

  @Column({ allowNull: false })
    password: string;

  @Column({ allowNull: false })
    phone: string;

  @Column({ type: DataType.TEXT, allowNull: true })
    avatar: string;
  
}
