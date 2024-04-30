import { Group } from "../models/group.model";

class GroupService {

  async getAll() {
    return await Group.findAll();
  }

  async getByPK(id: number) {
    return await Group.findByPk(id);
  }

  async getByName(name: string) {
    return await Group.findOne({ where: { name } });
  }

}

export default new GroupService();