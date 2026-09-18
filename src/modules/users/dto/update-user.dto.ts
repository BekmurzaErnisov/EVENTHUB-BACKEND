import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString({ message: 'Имя должно быть строкой' })
  @IsNotEmpty({ message: 'Имя не должно быть пустым' })
  name: string;

  @IsOptional()
  @IsEmail({}, { message: 'Некорректный формат email' })
  email: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;
}