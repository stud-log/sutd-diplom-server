import { Subject } from "../models/subject.model";
import { Timetable } from "../models/timetable.model";
import { User } from "../models/user.model";

class SubjectService {

  async getAll() {
    return await Subject.findAll({ include: [ { model: User } ] });
  }

  async assignTeacher(userId: number, subjectIds: number[]) {
    const foundSubjects = await Subject.findAll({ where: { id: subjectIds } });
    const existTeacher = foundSubjects.filter(subject => subject.userId && subject.userId !== userId);
    if(existTeacher.length > 0) throw 'Предметы не присвоены! Указанные предметы уже имеют преподавателя. Вначале следует снять преподавателя с предмета, а затем назначать нового';
    return await Subject.update({ userId }, { where: {
      id: subjectIds
    } });
  }

  async unassignTeacher(userId: number, subjectIds: number[]) {
    const foundSubjects = await Subject.findAll({ where: { id: subjectIds } });
    const alreadyTeacher = foundSubjects.filter(subject => subject.userId === userId);
    if(alreadyTeacher.length == 0) throw 'Преподаватель не ведет ни один из указанных предметов';
    return await Subject.update({ userId: null }, { where: {
      id: alreadyTeacher.map(i => i.id)
    } });
  }

  async getByGroup(groupId: string) {
    const subjectIds = await Timetable.findAll({ where: { groupId: Number(groupId) }, attributes: [ 'subjectId' ], group: [ 'subjectId' ] });
    const subjects = await Subject.findAll({ where: { id: subjectIds.map(({ subjectId }) => subjectId) }, include: [ { model: User } ], });

    return subjects;
  }

}

export default new SubjectService();