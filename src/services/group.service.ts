import { Group } from "../models/group.model";

class GroupService {

  async getAll() {
    return await Group.findAll();
  }

  async getByName(name: string) {
    return await Group.findOne({ where: { name } });
  }

}

export default new GroupService();