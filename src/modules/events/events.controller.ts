import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateEventDto } from './dto/create-event.dto';
import { EventsService } from './events.service';
import { GetEventQueryDto } from './dto/get-event.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from 'src/config/multer.config';

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
    return this.eventsService.findAll(query);
  }
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    return this.eventsService.remove(id, request.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('uploads')
  @UseInterceptors(FileInterceptor('file', multerOptions))
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    return this.eventsService.handleImageUpload(file)
  }
}
