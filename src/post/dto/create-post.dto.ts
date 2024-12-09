import { InputType, Field, Int } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsOptional, Length } from 'class-validator';

@InputType()
export class CreatePostDto {
  @Field()
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  @Length(1, 25, {
    message: 'Title must be between 1 and 25 characters long',
  })
  readonly title: string;

  @Field()
  @IsString()
  @IsNotEmpty({ message: 'Content is required' })
  @Length(10, 500, {
    message: 'Content must be between 10 and 500 characters long',
  })
  readonly content: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  readonly UserId?: number;
}
