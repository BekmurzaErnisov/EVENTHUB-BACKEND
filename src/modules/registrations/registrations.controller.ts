import {
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RegistrationsService } from './registrations.service';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
  };
}

@ApiTags('Registrations')
@ApiBearerAuth()
@Controller('events')
export class RegistrationsController {
  constructor(
    private readonly registrationsService: RegistrationsService,
  ) {}

  @ApiOperation({ summary: 'Получение всех регистраций текущего пользователя' })
  @Get('my/registrations')
  @UseGuards(JwtAuthGuard)
  findMyRegistrations(@Req() request: AuthenticatedRequest) {
    return this.registrationsService.findUserRegistrations(request.user.id);
  }

  @ApiOperation({ summary: 'Регистрация на мероприятие' })
  @Post(':id/register')
  @UseGuards(JwtAuthGuard)
  register(
    @Param('id', ParseUUIDPipe) eventId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.registrationsService.register(eventId, request.user.id);
  }

  @ApiOperation({ summary: 'Отмена регистрации на мероприятие' })
  @Delete(':id/register')
  @UseGuards(JwtAuthGuard)
  unregister(
    @Param('id', ParseUUIDPipe) eventId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.registrationsService.unregister(eventId, request.user.id);
  }
}