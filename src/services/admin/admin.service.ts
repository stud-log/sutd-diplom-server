import userAdminService from "./user-admin.service";

class AdminService {

  public userService = userAdminService;

}

export default new AdminService();