import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Post } from './post.entity';

@Entity({ name: 'Comments' }) // You can specify table name if needed
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: false }) //don't define column name
  UserId: number;

  @ManyToOne(() => User, (user) => user.comments, { nullable: false })
  @JoinColumn()
  user: User;

  @Column({ type: 'int', nullable: false })
  PostId: number;

  @ManyToOne(() => Post, (post) => post.comments, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn()
  post: Post;

  @Column({ type: 'int', nullable: true })
  ParentCommentId: number;

  @ManyToOne(() => Comment, (comment) => comment.childComments, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn()
  parentComment: Comment;

  @Column({ type: 'varchar', length: 100, nullable: false })
  content: string;

  // Define the relation if comments can have child comments
  childComments: Comment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
