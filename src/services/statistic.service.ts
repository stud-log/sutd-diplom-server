import { UserTask, UserTaskStatus } from "../models/user-tasks.model";

import { Homework } from "../models/homeworks.model";
import { Record } from "../models/records.model";
import { User } from "../models/user.model";
import userService from "./user.service";

class StatisticService {

  hwStats = async (userId: number) => {
    try {
      const user = await User.findByPk(userId, {
        include: [
          {
            model: UserTask,
            include: [ { model: Record, as: 'record' } ]
          }
        ]
      });
      if(!user) throw 'Cannot find user';
      console.log(user.tasks);
      const userHwTasks = user.tasks.filter(task => task.record?.recordTable == 'Homework');
      const totalHws = await Homework.count({ where: { groupId: user.groupId } });
      const stats = {
        total: totalHws,
        inProgress: userHwTasks.filter(i => i.status == UserTaskStatus.inProgress).length,
        passed: userHwTasks.filter(i => i.status == UserTaskStatus.passed).length,
        feedback: userHwTasks.filter(i => i.status == UserTaskStatus.feedback).length,
        
      };
      return ({
        ...stats,
        unTaken: stats.total - stats.feedback - stats.inProgress - stats.passed
      });
    }
    catch(e) {
      console.log(e);
    }
  };
}

export default new StatisticService();
