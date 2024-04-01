import { Group } from "../models/group.model";
import { Subject } from "../models/subject.model";

class GroupService {

  async getAll() {
    return await Subject.findAll();
  }

}

export default new GroupService();