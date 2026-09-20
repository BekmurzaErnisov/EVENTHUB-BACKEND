import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import type { RequestWithUser } from 'src/common/interfaces/requset-with-user.interface';
import { multerOptions } from 'src/config/multer.config';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from 'src/common/guards/optional-auth.guard';
import { CreateEventDto } from './dto/create-event.dto';
import { GetEventQueryDto } from './dto/get-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventsService } from './events.service';

@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Создание нового мероприятия' })
  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body() createEventDto: CreateEventDto,
    @Req() request: RequestWithUser,
  ) {
    return this.eventsService.create(createEventDto, request.user.id);
  }

  @ApiOperation({ summary: 'Получение списка мероприятий с фильтрацией' })
  @Get()
  async findAll(@Query() query: GetEventQueryDto) {
    return this.eventsService.findAll(query);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получение мероприятий текущего организатора' })
  @UseGuards(JwtAuthGuard)
  @Get('my')
  findMyEvents(@Req() req: RequestWithUser) {
    return this.eventsService.findByOrganizer(req.user.id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Загрузка обложки для мероприятия' })
  @ApiConsumes('multipart/form-data')
  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', multerOptions))
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    return this.eventsService.handleImageUpload(file);
  }

  @ApiOperation({ summary: 'Получение детальной информации о мероприятии' })
  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: { user?: { id: string } },
  ) {
    const userId = req.user?.id;
    return this.eventsService.findOne(id, userId);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Обновление мероприятия' })
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateEventDto: UpdateEventDto,
    @Req() request: RequestWithUser,
  ) {
    return this.eventsService.update(id, updateEventDto, request.user.id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Удаление мероприятия' })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: RequestWithUser,
  ) {
    return this.eventsService.remove(id, request.user.id);
  }
}