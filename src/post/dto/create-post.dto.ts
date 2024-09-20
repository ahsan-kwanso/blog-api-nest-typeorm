import { IsString, IsNotEmpty, IsOptional, Length } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  @Length(1, 25, {
    message: 'Title must be between 1 and 25 characters long',
  })
  readonly title: string;

  @IsString()
  @IsNotEmpty({ message: 'Content is required' })
  @Length(10, 500, {
    message: 'Content must be between 10 and 500 characters long',
  })
  readonly content: string;

  @IsOptional()
  readonly UserId?: number;
}
