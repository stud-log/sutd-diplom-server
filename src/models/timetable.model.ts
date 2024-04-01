import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';

import { Group } from './group.model';
import { Subject } from './subject.model';

export enum TimetableTypes {
  practice = 'Пр',
  lecture = 'Лек',
  both = 'Лек, Пр',
  lab = 'Лаб'
}

export enum TimetableWeekdays {
  Mon = 'Mon',
  Tue = 'Tue',
  Wed = 'Wed',
  Thu = 'Thu',
  Fri = 'Fri',
  Sat = 'Sat',
  Sun = 'Sun',
}

export enum TimetableWeekparities {
  even = '0',
  odd = '1',
  both = 'both',
}

export interface TimetableAttrs {
  id?: number;
  groupId: number;
  subjectId: number;
  type: TimetableTypes;
  weekday: TimetableWeekdays;
  weekparity: TimetableWeekparities;
  startTime: string;
  endTime: string;
  classroom?: string;
  link?: string;
}

/**
 *
 * Расписание это цикличное повторение одних и тех же предметов,
 * поэтому мы указываем только название предмета, четность недели и время начала пары.
 * Так как в теории приложение расчитано на множество групп, то мы так же указываем и ее.
 * Здесь:
 * * start - время начала (конец высчитывается автоматически, + 1.5 ак.ч.)
 * * weekday - день недели
 * * weekparity - четность недели in ['even', 'odd', 'both']
 * * classroom - номер аудитории (может быть пустым - тогда ДО)
 * * link - ссылка на ДО (может быть пустым)
 * * type - лекция\практика\экзамен
 */
@Table({ tableName: 'Timetable' })
export class Timetable extends Model<Timetable, TimetableAttrs> {
  @Column({ primaryKey: true, allowNull: false, autoIncrement: true, unique: true })
    id: number;

  @ForeignKey(() => Group)
  @Column({ allowNull: false })
    groupId: number;

  @BelongsTo(() => Group)
    group: Group;

  @ForeignKey(() => Subject)
  @Column({ allowNull: false })
    subjectId: number;

  @BelongsTo(() => Subject)
    subject: Subject;

  @Column({ values: Object.values(TimetableTypes), allowNull: false })
    type: string;

  @Column({ values: Object.values(TimetableWeekdays), allowNull: false })
    weekday: string;

  @Column({ values: Object.values(TimetableWeekparities), allowNull: false })
    weekparity: string;

  @Column({ allowNull: false })
    startTime: string;
  
  @Column({ allowNull: false })
    endTime: string;

  @Column({ allowNull: true })
    classroom: string;

  @Column({ allowNull: true, type: DataType.TEXT })
    link: string;

}