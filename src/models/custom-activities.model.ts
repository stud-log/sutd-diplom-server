import { AfterCreate, BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { Calendar, CalendarActivityType } from './calendar.model';

import { Group } from './group.model';
import { User } from './user.model';

interface CustomActivityAttrs {
  id?: number;
  userId: number;
  groupId: number;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
}

@Table({ tableName: 'CustomActivities' })
export class CustomActivity extends Model<CustomActivity, CustomActivityAttrs> {
  @Column({ primaryKey: true, allowNull: false, autoIncrement: true, unique: true })
    id: number;

  @ForeignKey(() => User)
  @Column({ allowNull: false })
    userId: number;

  @BelongsTo(() => User)
    user: User;

  @ForeignKey(() => Group)
  @Column({ allowNull: false })
    groupId: number;

  @BelongsTo(() => Group)
    group: Group;

  @Column({ allowNull: false })
    title: string;

  @Column({ type: DataType.TEXT, allowNull: true })
    description: string;

  @Column({ allowNull: false })
    startDate: string;

  @Column({ allowNull: false })
    endDate: string;

  @AfterCreate({})
  static async createCalendar(instance: CustomActivity) {
    await Calendar.create({
      activityId: instance.id,
      activityType: CalendarActivityType.custom,
      startDate: instance.startDate,
      endDate: instance.endDate
    });
  }
}