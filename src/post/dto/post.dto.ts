import { ObjectType, Field, Int } from '@nestjs/graphql';

// PostResponse Type
@ObjectType()
export class PostResponse {
  @Field(() => Int)
  id: number;

  @Field({ nullable: true })
  author?: string; // Represents the user's name

  @Field()
  title: string;

  @Field()
  content: string;

  @Field()
  date: Date; // Formatted date as YYYY-MM-DD
}

// PaginatedPostsResponse Type (without generics)
@ObjectType()
export class PaginatedPostsResponse {
  @Field(() => Boolean, { nullable: true })
  success?: boolean;

  @Field(() => [PostResponse])
  posts: PostResponse[];

  @Field(() => Int)
  total: number;

  @Field(() => Int, { nullable: true })
  page?: number;

  @Field(() => Int, { nullable: true })
  pageSize?: number;

  @Field(() => String, { nullable: true })
  nextPage?: string | null;
}
