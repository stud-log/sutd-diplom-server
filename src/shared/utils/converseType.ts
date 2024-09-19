import { TimetableTypes } from "../../models/timetable.model";

export const converseType = (value: string) => {
  switch (value.trim().replaceAll(' ', '')) {
    case 'Лек,Пр':
      return TimetableTypes.both;
    case 'Лаб':
      return TimetableTypes.lab;
    case 'Пр':
      return TimetableTypes.practice;
    case 'Лек':
      return TimetableTypes.lecture;
    default:
      return TimetableTypes.both;
  }
};