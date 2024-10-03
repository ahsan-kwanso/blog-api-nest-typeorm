import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsOptional, IsNotEmpty, Length } from 'class-validator';

@InputType()
export class UpdatePostDto {
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'Title is required' })
  @Length(1, 25, {
    message: 'Title must be between 1 and 25 characters long',
  })
  readonly title?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'Content is required' })
  @Length(10, 500, {
    message: 'Content must be between 10 and 500 characters long',
  })
  readonly content?: string;
}
