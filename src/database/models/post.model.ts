import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import { User } from './user.model';
import { Comment } from './comment.model';

@Table
export class Post extends Model<Post> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  UserId: number;

  @BelongsTo(() => User)
  user: User;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
  })
  title: string;

  @Column({
    type: DataType.STRING(500),
    allowNull: false,
  })
  content: string;

  @HasMany(() => Comment)
  comments: Comment[];
}
