import * as csv from 'fast-csv';

import { TimetableAttrs, TimetableTypes } from '../models/timetable.model';
import { TimetableWeekdays, TimetableWeekparities } from './../models/timetable.model';

import { converseType } from '../shared/utils/converseType';
import { converseWeekday } from '../shared/utils/converseWeekday';
import { converseWeekparity } from '../shared/utils/converseWeekparity';
import fs from 'fs';
import groupService from './group.service';
import path from 'path';
import subjectsService from './subjects.service';
import xlsx from 'xlsx';

/**
 * Service for work with excel student cycled timetable
 */
class TimetableService {
  async parseExcelTimetable (
    table: Express.Multer.File,
    progressCallback: (progress: number, description: string) => void,
    onParseError: (row: number, message: string) => void
  ): Promise<TimetableAttrs[]> {
    
    // Convert to csv
    const pathToXLSX = path.resolve(`${table.path}`);
    const pathToCSV = path.resolve(`${table.path.replace('xlsx', 'csv')}`);
    const workBook = xlsx.readFile(pathToXLSX);
    await xlsx.writeFile(workBook, pathToCSV, { bookType: 'csv' });
    fs.unlinkSync(pathToXLSX);

    // First pass: Count total number of rows
    let totalLines = 0;
    const countStream = fs.createReadStream(pathToCSV);
    const csvCountStream = csv.parse({
      delimiter: ','
    }).on('data', () => {
      totalLines++;
    });
    await new Promise((resolve, reject) => {
      countStream.pipe(csvCountStream)
        .on('end', resolve)
        .on('error', reject);
    });
    progressCallback(0.1, `Found ${totalLines} rows`);

    const groups = await groupService.getAll();
    const subjects = await subjectsService.getAll();

    // Second pass: Parse data and send progress updates with descriptions
    let processedLine = 0;
    const parseStream = fs.createReadStream(pathToCSV);
    const csvData: TimetableAttrs[] = [];
    const csvStream = csv
      .parse({
        delimiter: ',',
      })
      .on('data', (data) => {
        const groupId = groups.find(aGroup => aGroup.name === data[3])?.id;
        const subjectId = subjects.find(aSubject => aSubject.title === data[5])?.id;
        const splittedTime = data[12].split('-');
        
        if(!groupId || !subjectId) {
          onParseError(processedLine, 'Group or subject not found');
          return;
        }
        const structuredData: TimetableAttrs = {
          groupId,
          subjectId,
          type:  converseType(data[7]),
          weekday: converseWeekday(data[10]),
          weekparity: converseWeekparity(data[11]),
          startTime: splittedTime[0],
          endTime: splittedTime[1],
          classroom: data[14],
          link: ''
        };
        csvData.push(structuredData);
        // Вычитаем 20%, так как на этом операции не заканчиваются
        progressCallback(Math.max(0.1, Math.round((++processedLine / totalLines) * 100) - 20), 'Parsing rows');
      });

    parseStream.pipe(csvStream);

    return new Promise((resolve, reject) => {
      csvStream.on('end', async () => {
        resolve(csvData);
      });
    });
  }
}

export default new TimetableService();
