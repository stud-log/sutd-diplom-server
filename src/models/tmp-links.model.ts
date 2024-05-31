import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';

interface TemporaryLinkAttrs {
  id?: number;
  hash: string;
  expires: string;
  group?: string;
}
/**
* Используется для хранения и проверки ссылок восстановления пароля, а так же приглашений в группу
*/
@Table({ tableName: 'TemporaryLinks' })
export class TemporaryLink extends Model<TemporaryLink, TemporaryLinkAttrs> {
  @Column({ primaryKey: true, allowNull: false, autoIncrement: true, unique: true })
  declare id: number;

  @Column({ allowNull: false })
    hash: string;
  
  @Column({ allowNull: true })
    group: string;
  
  @Column({ allowNull: false, comment: 'live time for hash' })
    expires: string;
}
