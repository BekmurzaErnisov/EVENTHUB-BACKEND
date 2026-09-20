import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { RequestWithUser } from 'src/common/interfaces/requset-with-user.interface';
import { multerOptions } from 'src/config/multer.config';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateEventDto } from './dto/create-event.dto';
import { GetEventQueryDto } from './dto/get-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventsService } from './events.service';
import { OptionalJwtAuthGuard } from 'src/common/guards/optional-auth.guard';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body() createEventDto: CreateEventDto,
    @Req() request: RequestWithUser,
  ) {
    return this.eventsService.create(createEventDto, request.user.id);
  }

  @Get()
  async findAll(@Query() query: GetEventQueryDto) {
    return this.eventsService.findAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  findMyEvents(@Req() req: RequestWithUser) {
    return this.eventsService.findByOrganizer(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', multerOptions))
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    return this.eventsService.handleImageUpload(file);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id;
    return this.eventsService.findOne(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
    @Req() request: RequestWithUser,
  ) {
    return this.eventsService.update(id, updateEventDto, request.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() request: RequestWithUser) {
    return this.eventsService.remove(id, request.user.id);
  }
}
