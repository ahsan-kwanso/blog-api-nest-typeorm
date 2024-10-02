import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { Post } from '../post/post.entity';
import { BaseEntity } from '../common/base.entity';

@ObjectType() // Mark this class as a GraphQL Object Type
@Entity({ name: 'Comments' }) // Specify table name if needed
export class Comment extends BaseEntity {
  @Field(() => Int) // Expose UserId as an integer in GraphQL
  @Column({ type: 'int', nullable: false })
  UserId: number;

  @Field(() => User) // Expose the user object in GraphQL
  @ManyToOne(() => User, (user) => user.comments, { nullable: false })
  @JoinColumn({ name: 'UserId' })
  user: User;

  @Field(() => Int) // Expose PostId as an integer in GraphQL
  @Column({ type: 'int', nullable: false })
  PostId: number;

  @Field(() => Post) // Expose the post object in GraphQL
  @ManyToOne(() => Post, (post) => post.comments, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'PostId' })
  post: Post;

  @Field(() => Int, { nullable: true }) // Expose ParentCommentId as an optional field
  @Column({ type: 'int', nullable: true })
  ParentCommentId: number;

  @Field(() => Comment, { nullable: true }) // Expose the parent comment object
  @ManyToOne(() => Comment, (comment) => comment.childComments, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'ParentCommentId' })
  parentComment: Comment;

  @Field() // Expose content as a string in GraphQL
  @Column({ type: 'varchar', length: 100, nullable: false })
  content: string;

  @Field(() => [Comment], { nullable: true }) // Expose child comments as an array of Comment objects
  childComments: Comment[];
}
