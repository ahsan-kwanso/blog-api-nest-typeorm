import { Resolver, Query } from '@nestjs/graphql';
import { GraphQLString } from 'graphql';

@Resolver()
export class AppResolver {
  @Query(() => GraphQLString)
  getHello(): string {
    return 'Hello World!';
  }
}
