import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Post } from '../post/post.entity';
import { Comment } from '../comment/comment.entity';

enum Role {
  USER = 'user',
  ADMIN = 'admin',
}

// separate table for role

@Entity({ name: 'Users' }) // Specify table name if needed, make common id , cat,uat separate class
export class User {
  @PrimaryGeneratedColumn() // see about uuid
  id: number;

  @Column({ type: 'varchar', length: 50, nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 50, nullable: false, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 100, nullable: false, select: false }) // Exclude password by default
  password: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.USER, // Default role is user
  })
  role: Role;

  @OneToMany(() => Post, (post) => post.user)
  posts: Post[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  @Column({ default: false })
  isVerified: boolean;

  @Column({ nullable: true })
  verificationToken: string;

  @Column({ type: 'varchar', length: 550, nullable: true })
  profilePictureUrl: string; // New column for profile picture URL

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
