import { BelongsTo, Column, ForeignKey, Model, Table } from 'sequelize-typescript';

import { User } from './user.model';

interface UserSettingAttrs {
  id?: number;
  userId: number;
  theme?: string;
  nickColor?: string;
}

@Table({ tableName: 'UserSettings' })
export class UserSetting extends Model<UserSetting, UserSettingAttrs> {
  @Column({ primaryKey: true, allowNull: false, autoIncrement: true, unique: true })
  declare id: number;

  @ForeignKey(() => User)
  @Column({ allowNull: false })
    userId: number;
  
  @BelongsTo(() => User)
    user: User;

  @Column({ defaultValue: 'base' })
    theme: string;

  @Column({ defaultValue: '#1E1E1E' })
    nickColor: string;
    
  @Column({ defaultValue: 'fio' })
    displayingName: string; // fio | nickname

}
