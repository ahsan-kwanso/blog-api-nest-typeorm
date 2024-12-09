import { IsOptional, IsString, IsInt, Length } from 'class-validator';
import { InputType, Field, Int } from '@nestjs/graphql'; // Import GraphQL decorators

@InputType() // Mark this class as a GraphQL InputType
export class UpdateCommentDto {
  @Field({ nullable: true, description: 'Content of the comment' }) // Expose content field in GraphQL
  @IsString()
  @IsOptional()
  @Length(1, 25, {
    message: 'comment must be between 1 and 25 characters long',
  })
  content?: string;

  @Field(() => Int, {
    nullable: true,
    description: 'ID of the post the comment belongs to',
  }) // Expose PostId in GraphQL
  @IsInt()
  @IsOptional()
  PostId?: number;

  @Field(() => Int, {
    nullable: true,
    description: 'ID of the parent comment if any',
  }) // Expose ParentCommentId in GraphQL
  @IsInt()
  @IsOptional()
  ParentCommentId?: number;
}
