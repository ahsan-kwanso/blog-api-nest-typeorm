import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType() // Specify this class as a GraphQL ObjectType
export class UserWithNumberOfPosts {
  @Field(() => Int) // Specify the field type for GraphQL
  id: number;

  @Field() // By default, the field type is inferred as String
  name: string;

  @Field() // By default, the field type is inferred as String
  email: string;

  @Field() // By default, the field type is inferred as String
  role: string;

  @Field(() => Int) // Specify the field type for GraphQL
  posts: number;
}

@ObjectType() // Specify this class as a GraphQL ObjectType
export class PaginatedUserWithNumberOfPosts {
  @Field(() => [UserWithNumberOfPosts]) // Define this field as an array of UserWithNumberOfPosts
  users: UserWithNumberOfPosts[];

  @Field(() => Int) // Specify the field type for GraphQL
  total: number;

  @Field({ nullable: true }) // Make page optional
  page?: number;

  @Field({ nullable: true }) // Make pageSize optional
  pageSize?: number;

  @Field({ nullable: true }) // Make nextPage optional
  nextPage: string | null;
}
