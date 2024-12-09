import { ObjectType, Field, Int } from '@nestjs/graphql';
import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@ObjectType() // Mark this as a GraphQL ObjectType (even though it's abstract)
export abstract class BaseEntity {
  @Field(() => Int) // Expose id as an integer
  @PrimaryGeneratedColumn()
  id: number;

  @Field() // Expose createdAt as a Date field in GraphQL
  @CreateDateColumn()
  createdAt: Date;

  @Field() // Expose updatedAt as a Date field in GraphQL
  @UpdateDateColumn()
  updatedAt: Date;
}
