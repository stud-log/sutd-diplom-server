import { AfterCreate, BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';

import { Group } from './group.model';
import { Record } from './records.model';

export enum CalendarActivityType {
  custom = 'custom',
  timetable = 'timetable',
}

interface CalendarAttrs {
  id?: number;
  activityId: number;
  activityType: CalendarActivityType;
  startDate: string;
  endDate: string;
}

/**
 * Когда мы создаем новую запись, то записываем ее в эту таблицу с указанием типа активности, к которой эта запись относится.
 * * activityType in ['custom', 'timetable']
 */
@Table({ tableName: 'Calendars', createdAt: false, updatedAt: false })
export class Calendar extends Model<Calendar, CalendarAttrs> {
  @Column({ primaryKey: true, allowNull: false, autoIncrement: true, unique: true })
  declare id: number;

  @ForeignKey(() => Record)
  @Column({ allowNull: true })
    recordId: number;
  
  @BelongsTo(() => Record)
    record: Record;

  @ForeignKey(() => Group)
  @Column({ allowNull: false })
    groupId: number;

  @BelongsTo(() => Group)
    group: Group;
    
  @Column({ allowNull: false })
    activityId: number;
    
  @Column({ allowNull: false })
    activityType: string;
    
  @Column({ allowNull: false })
    startDate: string;
  
  @Column({ allowNull: false })
    endDate: string;
    
  @AfterCreate({})
  static async createRecord(instance: Calendar) {
    const record = await Record.create({ recordTable: 'Calendar', recordId: instance.id, groupId: instance.groupId });
    instance.recordId = record.id;
    await instance.save();
  }
}

