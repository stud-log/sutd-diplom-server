import { User, UserStatus } from "../models/user.model";

import { Achievement } from "../models/achievements.model";
import { Group } from "../models/group.model";
import { UserSetting } from "../models/user-settings.model";

class AchievementService {

  async all() {
    return await Achievement.findAll();
  }

}

export default new AchievementService();