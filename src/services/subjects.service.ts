import { Subject } from "../models/subject.model";
import { Timetable } from "../models/timetable.model";

class SubjectService {

  async getAll() {
    return await Subject.findAll();
  }

  async getByGroup(groupId: string) {
    const subjectIds = await Timetable.findAll({ where: { groupId: Number(groupId) }, attributes: [ 'subjectId' ], group: [ 'subjectId' ] });
    const subjects = await Subject.findAll({ where: { id: subjectIds.map(({ subjectId }) => subjectId) } });

    return subjects;
  }

}

export default new SubjectService();