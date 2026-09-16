import {IsDateString,IsInt,IsNotEmpty,IsOptional,IsString,IsUUID,} from 'class-validator';

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

  @IsInt()
  capacity!: number;

  @IsOptional()
  @IsUUID()
  categoryId?: string;
}