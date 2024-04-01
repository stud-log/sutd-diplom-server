import { TimetableWeekparities } from "../../models/timetable.model";

export const converseWeekparity = (value: string) => {
  switch (value.trim()) {
    case 'числ/знам':
      return TimetableWeekparities.both;
    case 'числ':
      return TimetableWeekparities.odd;
    case 'знам':
      return TimetableWeekparities.even;
    default:
      return TimetableWeekparities.both;
  }
};