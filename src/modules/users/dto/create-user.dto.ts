import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'Некоректный формат email' })
  @IsNotEmpty({ message: 'Email обязятелен' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Пароль обязятелен' })
  @MinLength(6, { message: 'Пароль должен быть не менее 6 символов' })
  password: string;

  @IsString({ message: 'Имя должно быть строкой' })
  @IsNotEmpty({ message: 'Имя обязятельно для заполнения' })
  name: string;
}
