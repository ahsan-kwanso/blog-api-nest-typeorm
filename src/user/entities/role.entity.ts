import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ObjectType, Field, Int } from '@nestjs/graphql'; // Import GraphQL decorators
import { User } from './user.entity';

@ObjectType() // Mark this as a GraphQL ObjectType
@Entity()
export class Role {
  @Field(() => Int) // Expose id as an integer in GraphQL
  @PrimaryGeneratedColumn()
  id: number;

  @Field() // Expose name as a field in GraphQL
  @Column({ unique: true })
  name: string; // Should only contain 'user' or 'admin'

  @Field(() => [User]) // Expose users as an array of User entities in GraphQL
  @OneToMany(() => User, (user) => user.role)
  users: User[];
}
