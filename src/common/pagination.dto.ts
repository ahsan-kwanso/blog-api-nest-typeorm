import { IsInt, Min, Max, IsOptional, IsIn, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { InputType, Field } from '@nestjs/graphql';
import paginationConfig from 'src/utils/pagination.config';

@InputType() // Decorate the class as a GraphQL input type
export class PaginationQueryDto {
  @Field({ defaultValue: paginationConfig.defaultPage }) // Default value for GraphQL
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10)) // Transform string to number
  @IsInt({ message: 'Page number must be an integer' }) // Validate as integer after transformation
  @Min(1, { message: 'Page number must be at least 1' }) // Minimum value check
  @Max(100, { message: 'Page number cannot exceed 100' }) // Maximum limit check
  page: number = paginationConfig.defaultPage; // Default value for page

  @Field({ defaultValue: paginationConfig.defaultLimit }) // Default value for GraphQL
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10)) // Transform string to number
  @IsInt({ message: 'Limit must be an integer' }) // Validate as integer after transformation
  @Min(1, { message: 'Limit must be at least 1' }) // Minimum value check
  @Max(100, { message: 'Limit cannot exceed 100' }) // Maximum limit check
  limit: number = paginationConfig.defaultLimit; // Default value for limit

  @Field({ nullable: true }) // Make this field nullable in GraphQL
  @IsOptional() // Add this to allow `sortBy` as an optional field
  @IsString() // Ensure it's a string
  sortBy?: string;

  @Field({ nullable: true }) // Make this field nullable in GraphQL
  @IsOptional() // Add this to allow `sortOrder`
  @IsIn(['asc', 'desc']) // Restrict to 'asc' or 'desc'
  sortOrder?: 'asc' | 'desc';

  @Field({ nullable: true }) // Make this field nullable in GraphQL
  @IsOptional() // Add this to allow `role`
  @IsIn(['admin', 'user']) // Restrict to 'admin' or 'user'
  role?: 'admin' | 'user';

  @Field({ nullable: true }) // Make this field nullable in GraphQL
  @IsOptional()
  @IsString()
  filter?: string; // Optional filter for post type (e.g., 'my-posts')

  @Field({ nullable: true }) // Make this field nullable in GraphQL
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  userId?: number; // Optional userId for filtering posts by user

  @Field({ nullable: true }) // Make this field nullable in GraphQL
  @IsOptional()
  @IsString()
  title?: string; // Optional title for searching posts
}
