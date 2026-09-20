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
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
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
  @ApiResponse({ status: 201, description: 'Мероприятие успешно создано' })
  @ApiResponse({ status: 400, description: 'Ошибка валидации данных' })
  @ApiResponse({ status: 401, description: 'Неавторизованный пользователь' })
  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body() createEventDto: CreateEventDto,
    @Req() request: RequestWithUser,
  ) {
    return this.eventsService.create(createEventDto, request.user.id);
  }

  @ApiOperation({ summary: 'Получение списка мероприятий с фильтрацией' })
  @ApiResponse({
    status: 200,
    description: 'Список мероприятий успешно получен',
  })
  @Get()
  async findAll(@Query() query: GetEventQueryDto) {
    return this.eventsService.findAll(query);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получение мероприятий текущего организатора' })
  @ApiResponse({
    status: 200,
    description: 'Список мероприятий организатора получен',
  })
  @ApiResponse({ status: 401, description: 'Неавторизованный пользователь' })
  @UseGuards(JwtAuthGuard)
  @Get('my')
  findMyEvents(@Req() req: RequestWithUser) {
    return this.eventsService.findByOrganizer(req.user.id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Загрузка обложки для мероприятия' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 201,
    description: 'Файл успешно загружен, возвращен путь к нему',
  })
  @ApiResponse({
    status: 400,
    description: 'Файл не передан или неверный формат',
  })
  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', multerOptions))
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    return this.eventsService.handleImageUpload(file);
  }

  @ApiOperation({ summary: 'Получение детальной информации о мероприятии' })
  @ApiParam({ name: 'id', description: 'UUID мероприятия', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Информация о мероприятии успешно получена',
  })
  @ApiResponse({ status: 404, description: 'Мероприятие не найдено' })
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
  @ApiParam({ name: 'id', description: 'UUID мероприятия', type: 'string' })
  @ApiResponse({ status: 200, description: 'Мероприятие успешно обновлено' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен (не владелец)' })
  @ApiResponse({ status: 404, description: 'Мероприятие не найдено' })
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
  @ApiParam({ name: 'id', description: 'UUID мероприятия', type: 'string' })
  @ApiResponse({ status: 200, description: 'Мероприятие успешно удалено' })
  @ApiResponse({ status: 403, description: 'Доступ запрещен (не владелец)' })
  @ApiResponse({ status: 404, description: 'Мероприятие не найдено' })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: RequestWithUser,
  ) {
    return this.eventsService.remove(id, request.user.id);
  }
}
