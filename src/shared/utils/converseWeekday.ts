import { TimetableWeekdays } from "../../models/timetable.model";

export const converseWeekday = (value: string) => {
  switch (value.trim()) {
    case 'Понедельник':
      return TimetableWeekdays.Mon;
    case 'Вторник':
      return TimetableWeekdays.Tue;
    case 'Среда':
      return TimetableWeekdays.Wed;
    case 'Четверг':
      return TimetableWeekdays.Thu;
    case 'Пятница':
      return TimetableWeekdays.Fri;
    case 'Суббота':
      return TimetableWeekdays.Sat;
    case 'Воскресенье':
      return TimetableWeekdays.Sun;
    default:
      return TimetableWeekdays.Mon;
  }
};