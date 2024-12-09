import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { ObjectType, Field } from '@nestjs/graphql'; // Import GraphQL decorators
import { User } from './user.entity'; // Import User entity

@ObjectType() // Mark this as a GraphQL ObjectType
@Entity('followers') // Specify the table name if needed
export class Follower {
  @Field() // Expose id as a field in GraphQL
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => User) // Expose the follower relationship in GraphQL
  @ManyToOne(() => User, (user) => user.following, { onDelete: 'CASCADE' })
  follower: User; // The user who is following

  @Field(() => User) // Expose the followee relationship in GraphQL
  @ManyToOne(() => User, (user) => user.followers, { onDelete: 'CASCADE' })
  followee: User; // The user being followed

  @Field() // Expose followedAt as a field in GraphQL
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  followedAt: Date;
}
