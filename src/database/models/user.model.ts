import {
  Table,
  Column,
  Model,
  DataType,
  HasMany,
  BeforeSave,
} from 'sequelize-typescript';
import { Post } from './post.model';
import { Comment } from './comment.model';
import * as bcrypt from 'bcrypt';
import { Role } from 'src/types/role.enum';

@Table({
  timestamps: true,
  defaultScope: {
    attributes: { exclude: ['password'] }, // Exclude password by default
  },
  scopes: {
    withPassword: {
      attributes: { include: ['password'] }, // Include password when needed
    },
  },
})
export class User extends Model<User> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
  })
  name: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    unique: true,
  })
  email: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  password: string;

  @Column({
    type: DataType.ENUM('admin', 'user'),
    allowNull: false,
    defaultValue: 'user', // Default role is user
  })
  role: Role;

  @HasMany(() => Post)
  posts: Post[];

  @HasMany(() => Comment)
  comments: Comment[];

  // Add a beforeSave hook to hash the password before saving it to the database
  @BeforeSave
  static async hashPassword(user: User) {
    if (user.changed('password')) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    }
  }

  // Add a method to validate the password when logging in
  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}
