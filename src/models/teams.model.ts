import { AfterCreate, BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';

import { Group } from './group.model';
import { Record } from './records.model';
import { UserComment } from './user-comments.model';

interface TeamAttrs {
  id?: number;
  pinnedCommentId?: number;
  title: string;
  description?: string;
  groupId: number;
}

@Table({ tableName: 'Teams', updatedAt: false })
export class Team extends Model<Team, TeamAttrs> {
  @Column({ primaryKey: true, allowNull: false, autoIncrement: true, unique: true })
    id: number;

  @ForeignKey(() => Group)
  @Column({ allowNull: false })
    groupId: number;

  @BelongsTo(() => Group)
    group: Group;
    
  @ForeignKey(() => UserComment)
  @Column({ allowNull: true })
    pinnedCommentId: number;
  
  @BelongsTo(() => UserComment)
    pinnedComment: UserComment;
    
  @Column({ allowNull: false })
    title: string;
    
  @Column({ allowNull: true })
    description: string;
    
  @AfterCreate({})
  static async createRecord(instance: Team) {
    await Record.create({ recordTable: 'Team', recordId: instance.id, groupId: instance.groupId });
  }
}

