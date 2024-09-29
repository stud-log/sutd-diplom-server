import { Includeable } from "sequelize";
import { Group } from "../../../models/group.model";
import { UserRole } from "../../../models/user-roles.model";

export const defaultUserIncludes: Includeable | Includeable[] = [
  { model: Group },
  { model: UserRole },
];