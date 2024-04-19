import { Achievement } from './models/achievements.model';
import { Admin } from './models/admin.model';
import { AppFiles } from './models/files.model';
import { Calendar, } from './models/calendar.model';
import { CustomActivity } from './models/custom-activities.model';
import { Group } from './models/group.model';
import { Homework, } from './models/homeworks.model';
import { Log } from './models/logs.model';
import { News } from './models/news.model';
import { Record } from './models/records.model';
import { RefreshToken } from './models/refresh-tokens.model';
import { RolePermission } from './models/role-permissions.model';
import { Sequelize } from 'sequelize-typescript';
import { Subject } from './models/subject.model';
import { Team } from './models/teams.model';
import { TemporaryLink } from './models/tmp-links.model';
import { Timetable, } from './models/timetable.model';
import { User, } from './models/user.model';
import { UserAchievement } from './models/user-achievements.model';
import { UserAttendance } from './models/user-attendance.model';
import { UserComment } from './models/user-comments.model';
import { UserFavorite } from './models/user-favorites.model';
import { UserNotification } from './models/user-notifications.model';
import { UserReaction } from './models/user-reactions.model';
import { UserRole } from './models/user-roles.model';
import { UserTask, } from './models/user-tasks.model';
import { UserTeam } from './models/user-teams.model';
import { UserView } from './models/user-views.model';

export const sequelize = new Sequelize({
  database: process.env.DB_NAME,
  dialect: 'postgres',
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
  host: process.env.DB_HOST,
  storage: ':memory:',
  models: [
    Admin,
    Achievement,
    Calendar,
    CustomActivity,
    AppFiles,
    Group,
    Homework,
    Log,
    News,
    Record,
    RefreshToken,
    RolePermission,
    Subject,
    Team,
    TemporaryLink,
    Timetable,
    User,
    UserAchievement,
    UserAttendance,
    UserComment,
    UserFavorite,
    UserNotification,
    UserReaction,
    UserRole,
    UserTask,
    UserTeam,
    UserView,
  ],
});

/**
 * Fix count bug
 */
sequelize.addHook('beforeCount', function (options) {
  //@ts-expect-error `this`
  if (this._scope.include && this._scope.include.length > 0) {
    options.distinct = true;
    //@ts-expect-error `this`
    options.col = this._scope.col || options.col || `"${this.options.name.singular}".id`;
  }
  //@ts-expect-error `this`
  if (options.include && options.include.length > 0) {
    //@ts-expect-error `this`
    options.include = null;
  }
});

