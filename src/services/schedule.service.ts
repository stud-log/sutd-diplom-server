import { Calendar, CalendarActivityType } from "../models/calendar.model";
import { Timetable, TimetableAttrs, TimetableWeekdays, TimetableWeekparities, weekdayOrder } from "../models/timetable.model";

import { Op } from "sequelize";
import { Record } from "../models/records.model";
import { Subject } from "../models/subject.model";
import moment from "moment";
import { sequelize } from "../db";
import timetableService from "./timetable.service";

class ScheduleService {
  /**
   * Планируемое использование - в начале нового полугодия
   * @param table Файл с занятиями в полугодии
   */
  async regenerateGlobalCycledTimetable(
    table: Express.Multer.File,
    progressCallback: (progress: number, description: string) => void
  ) {
    progressCallback(0.01, 'Truncate timetable');
    await Timetable.truncate({ cascade: true });
    
    const parseErrors: {row: number; message: string}[] = [];
    const onParseError = (row: number, message: string) => {
      parseErrors.push({ row, message });
      console.error(`Parsing error on ${row} row: ${message}`);
    };
    progressCallback(0, 'Start conversion');
    let timetableRecords: TimetableAttrs[] | null = null;
    try {
      timetableRecords = await timetableService.parseExcelTimetable(table, progressCallback, onParseError);
    }
    catch (e) {
      console.log(e);
      console.log(parseErrors);
      throw 'Error parsing table';
    }
    progressCallback(80, 'Conversion completed. Start creating timetable');
    try {
      const created = await Timetable.bulkCreate(timetableRecords);
      progressCallback(99, 'Created successfully');
      return { parseErrors, totalCreated: created.length };
    }
    catch(e) {
      console.log(e);
      console.log(parseErrors);
      throw 'Error creating timetable';
    }
  }

  /**
   * Используется при локальном изменении расписания старостой группы из приложения
   */
  async regenerateGroupCycledTimetable(
    groupId: number,
    dto: TimetableAttrs[]
  ) {
    try {
      await Timetable.destroy({ where: { groupId } });
      await Timetable.bulkCreate(dto);
      await this.migrateGlobalCycledTimetableToCalendar(groupId);
      return true;
    }
    catch(e) {
      console.log(e);
      throw 'При обновлении расписания группы произошла непредвиденная ошибка';
    }

  }
  
  async migrateGlobalCycledTimetableToCalendar(groupId?: number) {
    try {
      // Determine the start and end dates based on the current semester
      const today = moment();
      let startDate: moment.Moment;
      let endDate: moment.Moment;

      if (today.month() < 5) { // If the current month is before June (the first half of the year)
        startDate = today; // Start from today
        endDate = moment(today).startOf('year').add(8, 'months'); // End on August 1st of the current year
      } else { // If the current month is June or later (the second half of the year)
        startDate = today; // Start from today
        endDate = moment(today).endOf('year'); // End on December 31st of the current year
      }

      // Fetch all rows from the Timetable table
      const timetables = await Timetable.findAll({ ...(groupId ? { where: { groupId } }: {}) });
      // Array to hold all calendar entries
      const calendarEntries = [];

      // Iterate over each timetable entry
      for (const timetable of timetables) {
        // Check if the timetable entry should be added to the calendar based on its weekparity
          
        // Calculate start date of the timetable entry
        let startDateTime = moment(startDate).startOf('day');
        startDateTime = startDateTime.day(this.getWeekdayNumber(timetable.weekday as TimetableWeekdays));
        startDateTime.set({
          hour: parseInt(timetable.startTime.slice(0, 2), 10),
          minute: parseInt(timetable.startTime.slice(3), 10)
        });

        // Calculate end date of the timetable entry
        let endDateTime = moment(startDateTime);
        endDateTime.set({
          hour: parseInt(timetable.endTime.slice(0, 2), 10),
          minute: parseInt(timetable.endTime.slice(3), 10)
        });

        // Repeat the timetable entry until the end date
        while (endDateTime <= endDate) {
          if (timetable.weekparity === TimetableWeekparities.both || timetable.weekparity === (endDateTime.date() % 2 === 0 ? TimetableWeekparities.even : TimetableWeekparities.odd)) {
            // Add the calendar entry
            calendarEntries.push({
              groupId: timetable.groupId,
              activityId: timetable.id,
              activityType: CalendarActivityType.timetable,
              startDate: startDateTime.format('YYYY-MM-DD HH:mm:ss'),
              endDate: endDateTime.format('YYYY-MM-DD HH:mm:ss'),
              // Copy other relevant fields from Timetable to Calendar
              // Adjust field names accordingly
            });
          }
          // Move to the next occurrence
          startDateTime = startDateTime.add(1, 'weeks');
          endDateTime = endDateTime.add(1, 'weeks');
        }
      }
      
      if(groupId) {
        await Record.destroy({ where: { groupId, recordTable: 'Calendar' }, cascade: true });
        await Calendar.destroy({ where: { groupId } });
      } else {
        await Record.destroy({ where: { recordTable: 'Calendar' }, cascade: true });
        await Calendar.truncate({ cascade: true });
      }
      // Сreate entries in the Calendar table
      // __NOTE__: we cant use bulk create because of using afterCreate hook
      await Promise.all(calendarEntries.map(entry => Calendar.create(entry)));

      console.log('Migration successful');
    } catch (error) {
      console.error('Error migrating timetable to calendar:', error);
    }
  }

  getWeekdayNumber(weekday: TimetableWeekdays): number {
    switch (weekday) {
      case TimetableWeekdays.Mon: return 1;
      case TimetableWeekdays.Tue: return 2;
      case TimetableWeekdays.Wed: return 3;
      case TimetableWeekdays.Thu: return 4;
      case TimetableWeekdays.Fri: return 5;
      case TimetableWeekdays.Sat: return 6;
      case TimetableWeekdays.Sun: return 0;
      default: throw new Error('Invalid weekday');
    }
  }

  /**
   * If wholeTable is false (as default), then return only rows in this week
   */
  async getSchedule (groupId: number, wholeTable = false) {
    const currentDayOfWeek = moment().day();
    
    const startDate = wholeTable ? null : moment().subtract(currentDayOfWeek - 1, 'days').toDate();
    const endDate = wholeTable ? null : moment().add(7 - currentDayOfWeek, 'days').toDate();

    return await Record.findAll({
      where: {
        recordTable: 'Calendar',
        groupId
      },
      order: [ [ { model: Calendar, as: 'calendar' } , 'startDate', 'ASC' ] ],
      include: [
        {
          model: Calendar,
          as: 'calendar',
          ...(wholeTable ? {} : {
            where: {
              startDate: {
                [Op.between]: [ startDate, endDate ],
              },
            }
          }),
          
          attributes: {
            include: [
              [ sequelize.literal(`(
                SELECT COALESCE(
                    json_agg(json_build_object(
                        'id', "Timetables"."id",
                        'type', "Timetables"."type",
                        'subjectId', "Timetables"."subjectId",
                        'weekday', "Timetables"."weekday",
                        'weekparity', "Timetables"."weekparity",
                        'startTime', "Timetables"."startTime",
                        'endTime', "Timetables"."endTime",
                        'classroom', "Timetables"."classroom",
                        'link', "Timetables"."link",
                        'subject', (
                            SELECT json_build_object(
                                'id', "Subjects"."id",
                                'title', "Subjects"."title",
                                'shortTitle', "Subjects"."shortTitle",
                                'teacherName', "Subjects"."teacherName"
                            ) AS subject
                            FROM "Subjects"
                            WHERE "Subjects"."id" = "Timetables"."subjectId"
                        )
                    )),
                    '[]'::json
                ) AS timetable
                FROM 
                    "Timetables" 
                WHERE 
                    "groupId" = "Record"."groupId" AND
                    "id" = "calendar"."activityId"
            )`), 'timetable' ],
              [ sequelize.literal(`(
              SELECT COALESCE(
                  json_agg(json_build_object(
                      'id', "CustomActivities"."id",
                      'userId', "CustomActivities"."userId",
                      'title', "CustomActivities"."title",
                      'description', "CustomActivities"."description",
                      'startDate', "CustomActivities"."startDate",
                      'endDate', "CustomActivities"."endDate"
                      
                  )),
                  '[]'::json
              ) AS custom
              FROM 
                  "CustomActivities" 
              WHERE 
                  "groupId" = "Record"."groupId" AND
                  "id" = "calendar"."activityId"
          )`), 'customActivity' ],
            ],
          },
        },
      ],
      
    });
  }

  async getScheduleElement (recordId: number) {

    return await Record.findAll({
      where: {
        recordTable: 'Calendar',
        id: recordId
      },
      
      include: [
        {
          model: Calendar,
          as: 'calendar',
          attributes: {
            include: [
              [ sequelize.literal(`(
                SELECT COALESCE(
                    json_agg(json_build_object(
                        'id', "Timetables"."id",
                        'type', "Timetables"."type",
                        'subjectId', "Timetables"."subjectId",
                        'weekday', "Timetables"."weekday",
                        'weekparity', "Timetables"."weekparity",
                        'startTime', "Timetables"."startTime",
                        'endTime', "Timetables"."endTime",
                        'classroom', "Timetables"."classroom",
                        'link', "Timetables"."link",
                        'subject', (
                            SELECT json_build_object(
                                'id', "Subjects"."id",
                                'title', "Subjects"."title",
                                'shortTitle', "Subjects"."shortTitle",
                                'teacherName', "Subjects"."teacherName"
                            ) AS subject
                            FROM "Subjects"
                            WHERE "Subjects"."id" = "Timetables"."subjectId"
                        )
                    )),
                    '[]'::json
                ) AS timetable
                FROM 
                    "Timetables" 
                WHERE 
                    "groupId" = "Record"."groupId" AND
                    "id" = "calendar"."activityId"
            )`), 'timetable' ],

              [ sequelize.literal(`(
              SELECT COALESCE(
                  json_agg(json_build_object(
                      'id', "CustomActivities"."id",
                      'userId', "CustomActivities"."userId",
                      'title', "CustomActivities"."title",
                      'description', "CustomActivities"."description",
                      'startDate', "CustomActivities"."startDate",
                      'endDate', "CustomActivities"."endDate"
                      
                  )),
                  '[]'::json
              ) AS custom
              FROM 
                  "CustomActivities" 
              WHERE 
                  "groupId" = "Record"."groupId" AND
                  "id" = "calendar"."activityId"
          )`), 'customActivity' ],
            ],
          },
        },
      ]
    });
  }

  async getGroupTimetable (groupId: number) {

    return await Timetable.findAll({
      where: {
        groupId
      },
      order: [
        sequelize.literal(`CASE
        WHEN weekday = '${TimetableWeekdays.Mon}' THEN 1
        WHEN weekday = '${TimetableWeekdays.Tue}' THEN 2
        WHEN weekday = '${TimetableWeekdays.Wed}' THEN 3
        WHEN weekday = '${TimetableWeekdays.Thu}' THEN 4
        WHEN weekday = '${TimetableWeekdays.Fri}' THEN 5
        WHEN weekday = '${TimetableWeekdays.Sat}' THEN 6
        WHEN weekday = '${TimetableWeekdays.Sun}' THEN 7
          END ASC`),
      ],
      include: [ Subject ]
    });
  }
  
}

export default new ScheduleService();
