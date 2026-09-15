import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty({ message: 'Старый пароль обязателен' })
  oldPassword: string

  @IsString()
  @IsNotEmpty({ message: 'Новый пароль обязателен' })
  @MinLength(6, { message: 'Новый пароль должен быть не менее 6 символов' })
  newPassword: string
}