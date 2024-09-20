import { IsString, IsOptional, IsNotEmpty, Length } from 'class-validator';

export class UpdatePostDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'Title is required' })
  @Length(1, 25, {
    message: 'Title must be between 1 and 25 characters long',
  })
  readonly title?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'Content is required' })
  @Length(10, 500, {
    message: 'Content must be between 10 and 500 characters long',
  })
  readonly content?: string;
}
