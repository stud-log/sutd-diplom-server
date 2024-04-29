import * as csv from 'fast-csv';

import { Timetable, TimetableAttrs, TimetableTypes } from '../models/timetable.model';

import { Group } from '../models/group.model';
import { Subject } from '../models/subject.model';
import { converseType } from '../shared/utils/converseType';
import { converseWeekday } from '../shared/utils/converseWeekday';
import { converseWeekparity } from '../shared/utils/converseWeekparity';
import fs from 'fs';
import groupService from './group.service';
import path from 'path';
import subjectsService from './subjects.service';
import xlsx from 'xlsx';

class SetupService {
  
  /**
  * Настройка всех групп. Крупный парсинг =)
  * Используется ТОЛЬКО из админки
  * @param table - Файл с занятиями в полугодии
  */
  async setup(
    table: Express.Multer.File,
    progressCallback: (progress: number, description: string) => void
  ) {
    progressCallback(0, 'Setup');

    // Must be ZERO errors or break.
    let errorsCount = 0;

    // Convert to csv
    const pathToXLSX = path.resolve(`${table.path}`);
    const pathToCSV = path.resolve(`${table.path.replace('xlsx', 'csv')}`);
    const workBook = xlsx.readFile(pathToXLSX);
    await xlsx.writeFile(workBook, pathToCSV, { bookType: 'csv' });
    fs.unlinkSync(pathToXLSX);

    // First pass: Count total number of rows, collect groups and subjects
    let totalLines = 0;
    const groupSet = new Set<string>();
    const subjectSet = new Set<string>();
    
    const countStream = fs.createReadStream(pathToCSV);
    const csvCountStream = csv.parse({
      delimiter: ','
    }).on('data', (data) => {
      totalLines++;
      const group = JSON.stringify({ name: data[3] });
      const subject = JSON.stringify({ title: data[5], teacherName: data[9] });
      if(!groupSet.has(group)) groupSet.add(group);
      if(!subjectSet.has(subject)) subjectSet.add(subject);
    });
    await new Promise((resolve, reject) => {
      countStream.pipe(csvCountStream)
        .on('end', resolve)
        .on('error', reject);
    });

    // Create collected groups and subjects
    try {
      progressCallback(0.1, `Create groups and subjects`);
      await Group.bulkCreate(Array.from(groupSet).map(groupString => JSON.parse(groupString)));
      await Subject.bulkCreate(Array.from(subjectSet).map(subjectString => JSON.parse(subjectString)));
    }
    catch (e) {
      console.log(e);
      throw 'Error creating groups and subjects';
    }

    progressCallback(0.2, `Start parsing timetable`);

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
        if(!data[0]) {
          return;
        }
        if(errorsCount > 0) {
          return;
        }
        const groupId = groups.find(aGroup => aGroup.name === data[3])?.id;
        const subjectId = subjects.find(aSubject => aSubject.title === data[5])?.id;
        const splittedTime = data[12].split('-');
        
        if(!groupId || !subjectId) {
          errorsCount++;
          return;
        }
        const structuredData: TimetableAttrs = {
          groupId,
          subjectId,
          type: converseType(data[7]),
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

    const timetableRecords = await new Promise<TimetableAttrs[]>((resolve, reject) => {
      csvStream.on('end', async () => {
        resolve(csvData);
      });
    });

    if(errorsCount > 0) throw 'Error collecting data';

    progressCallback(80, 'Conversion completed. Start creating timetable');
    try {
      await Timetable.bulkCreate(timetableRecords);
      progressCallback(99, 'Created successfully');
      return true;
    }
    catch(e) {
      console.log(e);
      throw 'Error creating timetable';
    }
  }

}

export default new SetupService();