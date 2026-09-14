import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsDateString()
  date!: string;

  @IsString()
  @IsNotEmpty()
  location!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  capacity: number;

  @IsNotEmpty()
  @IsString()
  image: string;

  @IsOptional()
  @IsUUID()
  categoryId?: number;
}
