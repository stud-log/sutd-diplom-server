import { Timetable, TimetableAttrs } from "../models/timetable.model";

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
  
}

export default new ScheduleService();
