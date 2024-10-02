import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { Comment } from '../comment/comment.entity';
import { BaseEntity } from '../common/base.entity';
import { ObjectType, Field, Int } from '@nestjs/graphql'; // Import GraphQL decorators

@ObjectType() // Mark this as a GraphQL ObjectType
@Entity({ name: 'Posts' }) // Specify table name if needed
export class Post extends BaseEntity {
  @Field(() => Int) // Expose UserId as an integer in GraphQL
  @Column({ type: 'int', nullable: false })
  UserId: number;

  @Field(() => User) // Expose user as a User entity in GraphQL
  @ManyToOne(() => User, (user) => user.posts, { nullable: false })
  @JoinColumn({ name: 'UserId' }) // needs to be specified
  user: User;

  @Field() // Expose title as a field in GraphQL
  @Column({ type: 'varchar', length: 50, nullable: false })
  title: string;

  @Field() // Expose content as a field in GraphQL
  @Column({ type: 'varchar', length: 500, nullable: false })
  content: string;

  @Field(() => [Comment]) // Expose comments as an array of Comment entities in GraphQL
  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];
}
