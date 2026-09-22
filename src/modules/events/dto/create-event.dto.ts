import { Transform, Type } from 'class-transformer';
import {IsDateString,IsInt, IsNotEmpty,IsNumber,IsOptional, IsString, Matches, MaxLength, Min,} from 'class-validator';
import { IsFutureDate } from '../validators/is-future-date.validator';

export class CreateEventDto {
  @IsString({ message: 'Название должно быть строкой' })
  @IsNotEmpty({ message: 'Название обязательно' })
  @MaxLength(200)
  title!: string;

  @IsString({ message: 'Описание должно быть строкой' })
  @IsNotEmpty({ message: 'Описание обязательно' })
  @MaxLength(1000)
  description!: string;

  @IsDateString({}, { message: 'Некорректный формат даты' })
  @IsFutureDate({ message: 'Дата мероприятия не может быть в прошлом' })
  @IsNotEmpty({ message: 'Дата обязательна' })
  date!: string;

  @IsString({ message: 'Адрес должен быть строкой' })
  @IsNotEmpty({ message: 'Адрес обязателен' })
  @MaxLength(300)
  location!: string; 
  
  @IsNumber({}, { message: 'Цена должна быть числом' })
  @Min(0, { message: 'Цена не может быть отрицательной' })
  price!: number;

  @IsInt({ message: 'Количество мест должно быть целым числом' })
  @Min(1, { message: 'Количество мест должно быть больше 0' })
  capacity!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'ID категории должен быть числом' })
  categoryId?: number;

  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsString()
  @Matches(/^(\/uploads\/[a-zA-Z0-9._-]+|https?:\/\/\S+)$/, {
    message: 'Некорректная ссылка на изображение',
  })
  imageUrl?: string;
}