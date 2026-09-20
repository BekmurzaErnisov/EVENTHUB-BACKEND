import { Body, Controller, Delete, Get, Patch, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import type { RequestWithUser } from 'src/common/interfaces/requset-with-user.interface';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from 'src/config/multer.config';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  async register(@Body() dto: CreateUserDto) {
    return this.usersService.register(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Req() req: RequestWithUser) {
    return this.usersService.getProfile(req.user.id)
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateProfile(@Req() req: RequestWithUser, @Body() dto: UpdateUserDto) {
    return this.usersService.updateProfile(req.user.id, dto)
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me/password')
  async changePassword(@Req() req: RequestWithUser, @Body() dto: ChangePasswordDto) {
    return this.usersService.changePassword(req.user.id, dto)
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me')
  async removeAccount(@Req() req: RequestWithUser) {
    return this.usersService.removeAccount(req.user.id)
  }

  @UseGuards(JwtAuthGuard)
  @Post('avatar')
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    return this.usersService.updateAvatar(req.user.id, file);
  }

  @Delete('avatar')
  @UseGuards(JwtAuthGuard)
  async deleateAvatar(@Req() req) {
    return this.usersService.deleteAvatar(req.user.id)
  }

}
