import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';

export enum LogType {
  entrance = 'entrance',
  comment = 'comment',
  edit = 'edit',
  create = 'create',
  service = 'service',
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
* Используется для логов и в качестве фиксации событий для достижений
*/
@Table({ tableName: 'Logs' })
export class Log extends Model<Log, LogAttrs> {
  @Column({ primaryKey: true, allowNull: false, autoIncrement: true, unique: true })
    id: number;

  @Column({ allowNull: true })
    recordId: string;
    
  @Column({ allowNull: true })
    userId: string;

  @Column({ allowNull: true, type: DataType.TEXT })
    content: string;

  @Column({ allowNull: false, defaultValue: false })
    isPublic: boolean;

  @Column({ allowNull: false, defaultValue: LogType.service })
    type: string;
  
}
