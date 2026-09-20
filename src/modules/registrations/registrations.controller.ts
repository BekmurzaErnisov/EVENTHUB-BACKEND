import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RegistrationsService } from './registrations.service';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
  };
}

@Controller('events')
export class RegistrationsController {
  constructor(
    private readonly registrationsService: RegistrationsService,
  ) {}

  @Post(':id/register')
  @UseGuards(JwtAuthGuard)
  register(
    @Param('id') eventId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.registrationsService.register(eventId, request.user.id);
  }

  @Delete(':id/register')
  @UseGuards(JwtAuthGuard)
  unregister(
    @Param('id') eventId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.registrationsService.unregister(eventId, request.user.id);
  }

  @Get('my/registrations')
  @UseGuards(JwtAuthGuard)
  findMyRegistrations(@Req() request: AuthenticatedRequest) {
    return this.registrationsService.findUserRegistrations(request.user.id);
  }
}