import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class GetEventQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'ID категории должен быть числом' })
  categoryId?: number;

  @IsOptional()
  @IsString()
  search?: string;
}