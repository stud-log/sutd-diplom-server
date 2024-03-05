import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';

import { User } from './user.model';

interface RefreshTokenAttrs {
  id?: number;
  userId: number;
  refreshToken: string;
}

@Table({ tableName: 'RefreshTokens', createdAt: false, updatedAt: false })
export class RefreshToken extends Model<RefreshToken, RefreshTokenAttrs> {
  @Column({ primaryKey: true, allowNull: false, autoIncrement: true, unique: true })
    id: number;

  @ForeignKey(() => User)
  @Column({ allowNull: false })
    userId: number;

  @BelongsTo(() => User)
    user: User;

  @Column({ allowNull: false })
    refreshToken: string;
}
