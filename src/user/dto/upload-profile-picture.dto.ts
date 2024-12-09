import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class UploadProfilePictureInput {
  @Field(() => Int)
  userId: number;

  @Field(() => String)
  file: any; // We'll change this in the resolver
}
