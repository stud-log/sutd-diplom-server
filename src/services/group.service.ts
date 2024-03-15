import { Group } from "../models/group.model";

export class GroupService {

  async getAll() {
    return await Group.findAll();
  }

  async getByName(name: string) {
    return await Group.findOne({ where: { name } });
  }

}