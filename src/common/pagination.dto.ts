import { IsInt, Min, Max, IsOptional, IsIn, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import paginationConfig from 'src/utils/pagination.config';

export class PaginationQueryDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10)) // Transform string to number
  @IsInt({ message: 'Page number must be an integer' }) // Validate as integer after transformation
  @Min(1, { message: 'Page number must be at least 1' }) // Minimum value check
  @Max(100, { message: 'Page number cannot exceed 100' }) // Maximum limit check
  page: number = paginationConfig.defaultPage;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10)) // Transform string to number
  @IsInt({ message: 'Limit must be an integer' }) // Validate as integer after transformation
  @Min(1, { message: 'Limit must be at least 1' }) // Minimum value check
  @Max(100, { message: 'Limit cannot exceed 100' }) // Maximum limit check
  limit: number = paginationConfig.defaultLimit;

  @IsOptional() // Add this to allow `sortBy` as an optional field
  @IsString() // Ensure it's a string
  sortBy?: string;

  @IsOptional() // Add this to allow `sortOrder`
  @IsIn(['asc', 'desc']) // Restrict to 'asc' or 'desc'
  sortOrder?: 'asc' | 'desc';

  @IsOptional() // Add this to allow `sortOrder`
  @IsIn(['admin', 'user']) // Restrict to 'admin' or 'user'
  role?: 'admin' | 'user';

  @IsOptional()
  @IsString()
  filter?: string; // Optional filter for post type (e.g., 'my-posts')

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  userId?: number; // Optional userId for filtering posts by user

  @IsOptional()
  @IsString()
  title?: string; // Optional title for searching posts
}
