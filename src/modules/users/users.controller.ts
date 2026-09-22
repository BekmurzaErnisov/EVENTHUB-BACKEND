import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { multerOptions } from 'src/config/multer.config';
import type { RequestWithUser } from 'src/common/interfaces/request-with-user.interface';
import { AuthRateLimitGuard } from '../auth/guards/auth-rate-limit.guard';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Регистрация пользователя' })
  @ApiResponse({ status: 201, description: 'Пользователь успешно зарегистрирован' })
  @UseGuards(AuthRateLimitGuard)
  @Post('register')
  async register(@Body() dto: CreateUserDto) {
    return this.usersService.register(dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получение профиля текущего пользователя' })
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Req() req: RequestWithUser) {
    return this.usersService.getProfile(req.user.id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Обновление профиля пользователя' })
  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateProfile(@Req() req: RequestWithUser, @Body() dto: UpdateUserDto) {
    return this.usersService.updateProfile(req.user.id, dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Смена пароля' })
  @UseGuards(JwtAuthGuard)
  @Patch('me/password')
  async changePassword(@Req() req: RequestWithUser, @Body() dto: ChangePasswordDto) {
    return this.usersService.changePassword(req.user.id, dto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Удаление аккаунта' })
  @UseGuards(JwtAuthGuard)
  @Delete('me')
  async removeAccount(@Req() req: RequestWithUser) {
    return this.usersService.removeAccount(req.user.id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Загрузка аватара пользователя' })
  @ApiConsumes('multipart/form-data')
  @UseGuards(JwtAuthGuard)
  @Post('avatar')
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: RequestWithUser,
  ) {
    return this.usersService.updateAvatar(req.user.id, file);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Удаление аватара' })
  @UseGuards(JwtAuthGuard)
  @Delete('avatar')
  async deleteAvatar(@Req() req: RequestWithUser) {
    return this.usersService.deleteAvatar(req.user.id);
  }
}