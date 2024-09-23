import { IsInt, Min, Max, IsOptional } from 'class-validator';
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
}
