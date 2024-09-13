import { IsInt, Min, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import paginationConfig from 'src/utils/pagination.config';

export class PaginationQueryDto {
  @IsOptional()
  @IsInt({ message: 'Page number must be an integer' })
  @Min(1, { message: 'Page number must be at least 1' })
  @Transform(({ value }) => parseInt(value, 10)) // Transform string to number
  page: number = paginationConfig.defaultPage;

  @IsOptional()
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Transform(({ value }) => parseInt(value, 10)) // Transform string to number
  limit: number = paginationConfig.defaultLimit;
}
