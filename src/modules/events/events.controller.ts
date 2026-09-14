import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/auth.module';
import { CreateEventDto } from './dto/create-event.dto';
import { EventsService } from './events.service';
import { GetEventQueryDto } from './dto/get-event.dto';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
  };
}

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body() createEventDto: CreateEventDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.eventsService.create(createEventDto, request.user.id);
  }

  @Get()
  async findAll(@Query() query: GetEventQueryDto) {
    return this.eventsService.findAll(query)
  }
}
