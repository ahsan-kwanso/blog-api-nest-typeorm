import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class Message {
  @Field()
  message: string;
}
