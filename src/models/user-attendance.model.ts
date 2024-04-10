import { BelongsTo, Column, DataType, ForeignKey, HasMany, HasOne, Model, Table } from 'sequelize-typescript';

import { Calendar } from './calendar.model';
import { Group } from './group.model';
import { User } from './user.model';

interface UserAttendanceAttrs {
  id?: number;
  userId: number;
  calendarId: number;
  groupId: number;
}

@Table({ tableName: 'UserAttendances' })
export class UserAttendance extends Model<UserAttendance, UserAttendanceAttrs> {
  @Column({ primaryKey: true, allowNull: false, autoIncrement: true, unique: true })
    id: number;

  @ForeignKey(() => Group)
  @Column({ allowNull: false })
    groupId: number;

  @BelongsTo(() => Group)
    group: Group;

  @ForeignKey(() => User)
  @Column({ allowNull: false })
    userId: number;
  
  @BelongsTo(() => User)
    user: User;

  @ForeignKey(() => Calendar)
  @Column({ allowNull: false })
    calendarId: number;
  
  @BelongsTo(() => Calendar)
    calendar: Calendar;

}
