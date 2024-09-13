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

  @Column({ name: 'UserId', type: 'int', nullable: false })
  UserId: number;

  @ManyToOne(() => User, (user) => user.comments, { nullable: false })
  @JoinColumn({ name: 'UserId' })
  user: User;

  @Column({ name: 'PostId', type: 'int', nullable: false })
  PostId: number;

  @ManyToOne(() => Post, (post) => post.comments, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'PostId' })
  post: Post;

  @Column({ name: 'ParentCommentId', type: 'int', nullable: true })
  ParentCommentId: number;

  @ManyToOne(() => Comment, (comment) => comment.childComments, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'ParentCommentId' })
  parentComment: Comment;

  @Column({ type: 'varchar', length: 100, nullable: false })
  content: string;

  // Define the relation if comments can have child comments
  childComments: Comment[];

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;
}
