import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsInt,
  Length,
} from 'class-validator';

export class CreateCommentDto {
  @IsNotEmpty({ message: 'content is required' })
  @IsString()
  @Length(1, 25, {
    message: 'comment must be between 1 and 25 characters long',
  })
  content: string;

  @IsInt()
  @IsNotEmpty({ message: 'valid post is required' })
  PostId: number;

  @IsInt()
  @IsOptional()
  ParentCommentId?: number;
}
