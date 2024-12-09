import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class OverallProgress {
  @Field()
  totalEmails: number;

  @Field()
  emailsProcessed: number;

  @Field()
  overallProgressPercentage: number;
}
