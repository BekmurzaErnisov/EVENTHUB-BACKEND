import { IsIn, IsInt, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetEventQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'ID категории должен быть числом' })
  categoryId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @IsOptional()
  @IsIn(['nearest', 'oldest', 'newest', 'added', 'title'])
  sort?: 'nearest' | 'oldest' | 'newest' | 'added' | 'title';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}