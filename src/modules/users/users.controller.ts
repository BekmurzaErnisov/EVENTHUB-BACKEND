import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';

import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import type { RequestWithUser } from 'src/common/interfaces/requset-with-user.interface';

@ApiTags('Users')
@Controller('users')
export class UsersController {


  constructor(
    private readonly usersService: UsersService,
  ) {}

  @ApiOperation({ summary: 'Регистрация пользователя' })
  @ApiResponse({ status: 201, description: 'Пользователь успешно зарегистрирован' })
  @Post('register')
  async register(@Body() dto: CreateUserDto) {
    return this.usersService.register(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Req() req: RequestWithUser) {
    return this.usersService.getProfile(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateProfile(@Req() req: RequestWithUser, @Body() dto: UpdateUserDto) {
    return this.usersService.updateProfile(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/password')
  async changePassword(@Req() req: RequestWithUser, @Body() dto: ChangePasswordDto) {
    return this.usersService.changePassword(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me')
  async removeAccount(@Req() req: RequestWithUser) {
    return this.usersService.removeAccount(req.user.id);
  }
}