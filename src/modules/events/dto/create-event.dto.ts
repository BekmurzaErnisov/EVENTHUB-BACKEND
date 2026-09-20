import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { IsFutureDate } from '../validators/is-future-date.validator';

export class CreateEventDto {
  @IsString({ message: 'Название должно быть строкой' })
  @IsNotEmpty({ message: 'Название обязательно' })
  title!: string;

  @IsString({ message: 'Описание должно быть строкой' })
  @IsNotEmpty({ message: 'Описание обязательно' })
  description!: string;

  @IsDateString({}, { message: 'Некорректный формат даты' })
  @IsFutureDate({ message: 'Дата мероприятия не может быть в прошлом' })
  @IsNotEmpty({ message: 'Дата обязательна' })
  date!: string;

  @IsString({ message: 'Адрес должен быть строкой' })
  @IsNotEmpty({ message: 'Адрес обязателен' })
  location!: string;

  @IsNumber({}, { message: 'Цена должна быть числом' })
  @Min(0, { message: 'Цена не может быть отрицательной' })
  price!: number;

  @IsInt({ message: 'Количество мест должно быть целым числом' })
  @Min(1, { message: 'Количество мест должно быть больше 0' })
  capacity!: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsTypeNumberOptional() // либо стандартная связка ниже:
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'ID категории должен быть числом' })
  @IsNotEmpty({ message: 'Категория обязательна' })
  categoryId!: number;
}