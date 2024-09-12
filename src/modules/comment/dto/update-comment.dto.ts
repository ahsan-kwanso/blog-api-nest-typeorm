import { IsOptional, IsString, IsInt, Length } from 'class-validator';

export class UpdateCommentDto {
  @IsString()
  @IsOptional()
  @Length(1, 25, {
    message: 'comment must be between 1 and 25 characters long',
  })
  content?: string;

  @IsInt()
  @IsOptional()
  PostId?: number;

  @IsInt()
  @IsOptional()
  ParentCommentId?: number;
}
