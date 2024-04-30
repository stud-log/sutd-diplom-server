import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';

import { Record } from './records.model';
import { User } from './user.model';

export enum LogType {
  entrance = 'entrance',
  comment = 'comment',
  edit = 'edit',
  create = 'create',
  service = 'service',
  readGuide = 'readGuide',
}

interface LogAttrs {
  id?: number;
  recordId?: number;
  userId?: number;
  content?: string;
  isPublic: boolean;
  type: LogType;
}
/**
* Используется для логов и в качестве фиксации событий для достижений.
* Пример - пользователь зашел в приложение - создаем запись entrance
* Пример - пользователь отредактировал пост - создаем запись comment и ставим ссылку на пост
*/
@Table({ tableName: 'Logs' })
export class Log extends Model<Log, LogAttrs> {
  @Column({ primaryKey: true, allowNull: false, autoIncrement: true, unique: true })
    id: number;

  @ForeignKey(() => Record)
  @Column({ allowNull: true })
    recordId: number;

  @BelongsTo(() => Record)
    record: Record;
    
  @ForeignKey(() => User)
  @Column({ allowNull: true })
    userId: number;
    
  @BelongsTo(() => User)
    user: User;

  @Column({ allowNull: true, type: DataType.TEXT })
    content: string;

  @Column({ allowNull: false, defaultValue: false })
    isPublic: boolean;

  @Column({ allowNull: false, defaultValue: LogType.service })
    type: string;
  
}
