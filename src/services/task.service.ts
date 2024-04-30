import { UserTask, UserTaskStatus } from "../models/user-tasks.model";

class TaskService {

  async changeHomeworkStatus ( dto: {recordId: number; status: UserTaskStatus} , userId: number) {
    try {
      const existedTask = await UserTask.findOne({ where: { recordId: dto.recordId, userId } });
      if(!existedTask) {
        return await UserTask.create({ recordId: dto.recordId, userId, status: UserTaskStatus.inProgress });
      }
      existedTask.status = dto.status;
      return await existedTask.save();
    }
    catch (err) {
      console.log(err);
      throw 'Не удалось изменить статус домашки';
    }
  }

}

export default new TaskService();