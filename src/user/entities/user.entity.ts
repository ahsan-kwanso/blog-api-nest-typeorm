import { Entity, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, Int } from '@nestjs/graphql'; // Import GraphQL decorators
import { Post } from '../../post/post.entity';
import { Comment } from '../../comment/comment.entity';
import { Role } from './role.entity';
import { BaseEntity } from '../../common/base.entity';
import { Follower } from './follower.entity';

@ObjectType() // Mark this as a GraphQL ObjectType
@Entity({ name: 'Users' }) // Specify table name if needed
export class User extends BaseEntity {
  @Field() // Expose name as a field in GraphQL
  @Column({ type: 'varchar', length: 50, nullable: false })
  name: string;

  @Field() // Expose email as a field in GraphQL
  @Column({ type: 'varchar', length: 50, nullable: false, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 100, nullable: false, select: false }) // Exclude password by default
  password: string;

  @Field(() => Int) // Expose RoleId as an integer in GraphQL
  @Column({ type: 'int', nullable: false, default: 1 })
  RoleId: number;

  @Field(() => Role) // Expose role as a field in GraphQL
  @ManyToOne(() => Role, { eager: true }) // Establish relationship with Role
  @JoinColumn({ name: 'RoleId' }) // Links to role table
  role: Role;

  @Field(() => [Post]) // Expose posts as an array of Post entities in GraphQL
  @OneToMany(() => Post, (post) => post.user)
  posts: Post[];

  @Field(() => [Comment]) // Expose comments as an array of Comment entities in GraphQL
  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  @Field() // Expose isVerified as a boolean in GraphQL
  @Column({ default: false })
  isVerified: boolean;

  @Field({ nullable: true }) // Expose verificationToken, allowing null
  @Column({ nullable: true })
  verificationToken: string;

  @Field({ nullable: true }) // Expose profilePictureUrl, allowing null
  @Column({ type: 'varchar', length: 550, nullable: true })
  profilePictureUrl: string; // New column for profile picture URL

  // --- New Follower and Following Relationships ---

  @Field(() => [Follower], { nullable: 'items' }) // Expose followers relationship in GraphQL
  @OneToMany(() => Follower, (follower) => follower.followee)
  followers: Follower[];

  @Field(() => [Follower], { nullable: 'items' }) // Expose following relationship in GraphQL
  @OneToMany(() => Follower, (follower) => follower.follower)
  following: Follower[];
}
