import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../user/user.entity';
import { Post } from '../post/post.entity';
import { BaseEntity } from '../common/base.entity';

@Entity({ name: 'Comments' }) // You can specify table name if needed
export class Comment extends BaseEntity {
  @Column({ type: 'int', nullable: false }) //don't define column name
  UserId: number;

  @ManyToOne(() => User, (user) => user.comments, { nullable: false })
  @JoinColumn({ name: 'UserId' })
  user: User;

  @Column({ type: 'int', nullable: false })
  PostId: number;

  @ManyToOne(() => Post, (post) => post.comments, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'PostId' })
  post: Post;

  @Column({ type: 'int', nullable: true })
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
}
