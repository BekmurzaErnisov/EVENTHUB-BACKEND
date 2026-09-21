import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
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
  constructor(private readonly registrationsService: RegistrationsService) {}

  @ApiOperation({ summary: 'Регистрация на мероприятие' })
  @ApiParam({ name: 'id', description: 'UUID мероприятия', type: 'string' })
  @ApiResponse({
    status: 201,
    description: 'Успешная регистрация на мероприятие',
  })
  @ApiResponse({
    status: 400,
    description: 'Места закончились или уже зарегистрирован',
  })
  @ApiResponse({ status: 404, description: 'Мероприятие не найдено' })
  @Post(':id/register')
  @UseGuards(JwtAuthGuard)
  register(@Param('id') eventId: string, @Req() request: AuthenticatedRequest) {
    return this.registrationsService.register(eventId, request.user.id);
  }

  @ApiOperation({ summary: 'Отмена регистрации на мероприятие' })
  @ApiParam({ name: 'id', description: 'UUID мероприятия', type: 'string' })
  @ApiResponse({ status: 200, description: 'Регистрация успешно отменена' })
  @ApiResponse({
    status: 404,
    description: 'Регистрация или мероприятие не найдено',
  })
  @Delete(':id/register')
  @UseGuards(JwtAuthGuard)
  unregister(
    @Param('id') eventId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.registrationsService.unregister(eventId, request.user.id);
  }

  @ApiOperation({ summary: 'Получение всех регистраций текущего пользователя' })
  @ApiResponse({
    status: 200,
    description: 'Список регистраций успешно получен',
  })
  @Get('my/registrations')
  @UseGuards(JwtAuthGuard)
  findMyRegistrations(@Req() request: AuthenticatedRequest) {
    return this.registrationsService.findUserRegistrations(request.user.id);
  }
}
