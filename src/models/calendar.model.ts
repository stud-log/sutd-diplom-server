import { AfterCreate, Column, DataType, Model, Table } from 'sequelize-typescript';

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
    id: number;
    
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
    await Record.create({ recordTable: 'Calendar', recordId: instance.id });
  }
}

