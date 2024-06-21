import { BelongsTo, Column, DataType, ForeignKey, HasMany, HasOne, Model, Table } from 'sequelize-typescript';

import { AppFiles } from './files.model';
import { Calendar } from './calendar.model';
import { Group } from './group.model';
import { Homework } from './homeworks.model';
import { News } from './news.model';
import { Team } from './teams.model';
import { UserComment } from './user-comments.model';
import { UserFavorite } from './user-favorites.model';
import { UserReaction } from './user-reactions.model';
import { UserTask } from './user-tasks.model';
import { UserView } from './user-views.model';

interface RecordAttrs {
  recordTable: string;
  recordId: number;
  groupId: number;
}

@Table({ tableName: 'Records' })
export class Record extends Model<Record, RecordAttrs> {
  @Column({ primaryKey: true, allowNull: false, autoIncrement: true, unique: true })
    id: number;

  /**
   * Needed for easy identifying group the records relates to
   */
  @ForeignKey(() => Group)
  @Column({ allowNull: false })
    groupId: number;

  @BelongsTo(() => Group)
    group: Group;

  @Column({ allowNull: false })
    recordTable: string;

  @Column({ allowNull: false })
    recordId: number;

  @HasOne(() => News)
    news: News;

  @HasOne(() => Homework)
    homework: Homework;

  @HasOne(() => Calendar)
    calendar: Calendar;

  @HasOne(() => Team)
    team: Team;

  @HasOne(() => UserTask, { foreignKey: 'myRecordId' })
    userTask: UserTask;

  @HasMany(() => UserComment, { foreignKey: 'recordId', onDelete: "CASCADE" })
    comments: UserComment[];

  @HasMany(() => UserReaction, { onDelete: "CASCADE" })
    reactions: UserReaction[];

  @HasMany(() => UserFavorite, { onDelete: "CASCADE" })
    favorites: UserFavorite[];

  @HasMany(() => AppFiles, { onDelete: "SET NULL" })
    files: AppFiles[];

  @HasMany(() => UserTask, { foreignKey: 'recordId', onDelete: "CASCADE" })
    userTasks: UserTask[];

  @HasMany(() => UserView, { onDelete: "CASCADE" })
    views: UserView[];

}
