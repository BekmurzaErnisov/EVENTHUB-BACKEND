import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEventDto } from './dto/create-event.dto';
import { Event } from './entities/event.entity';
import { GetEventQueryDto } from './dto/get-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

interface UploadedEventFile {
  filename: string;
}

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>,
  ) {}

  create(createEventDto: CreateEventDto, organizerId: string): Promise<Event> {
    const event = this.eventsRepository.create({
      ...createEventDto,
      date: new Date(createEventDto.date),
      organizer: { id: organizerId },
    });

    return this.eventsRepository.save(event);
  }

  async update(
    id: string,
    updateEventDto: UpdateEventDto,
    organizerId: string,
  ): Promise<Event> {
    const event = await this.eventsRepository.findOne({
      where: { id },
      relations: { organizer: true },
    });

    if (!event) {
      throw new NotFoundException('Мероприятие не найдено');
    }

    if (event.organizer.id !== organizerId) {
      throw new ForbiddenException(
        'Редактировать мероприятие может только его владелец',
      );
    }

    const { title, description, date, location } = updateEventDto;

    Object.assign(event, {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(date !== undefined && { date: new Date(date) }),
      ...(location !== undefined && { location }),
    });

    return this.eventsRepository.save(event);
  }

  async findAll(query: GetEventQueryDto): Promise<Event[]> {
    const { categoryId, search } = query;

    const queryBuilder = this.eventsRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.category', 'category')
      .leftJoinAndSelect('event.organizer', 'organizer');

    if (categoryId) {
      queryBuilder.andWhere('category.id = :categoryId', { categoryId });
    }

    if (search) {
      queryBuilder.andWhere('event.title ILike :search', {
        search: `%${search}%`,
      });
    }

    return queryBuilder.getMany();
  }

  async findOne(id: string): Promise<Event> {
    const event = await this.eventsRepository.findOne({
      where: { id },
      relations: {
        category: true,
        organizer: true,
      },
    });

    if (!event) {
      throw new NotFoundException('Мероприятие не найдено');
    }

    return event;
  }

  async findByOrganizer(organizerId: string): Promise<Event[]> {
    return this.eventsRepository.find({
      where: { organizer: { id: organizerId } },
      relations: {
        category: true,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async remove(id: string, userId: string): Promise<void> {
    const event = await this.eventsRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.organizer', 'organizer')
      .where('event.id = :id', { id })
      .getOne();

    if (!event) {
      throw new NotFoundException('Мероприятие не найдено');
    }

    if (event.organizer.id !== userId) {
      throw new ForbiddenException('Вы не можете удалить чужое мероприятие');
    }

    await this.eventsRepository.softRemove(event);
  }

  handleImageUpload(file?: UploadedEventFile) {
    if (!file) {
      throw new BadRequestException('Файл не был передан');
    }

    return {
      imageUrl: `/uploads/${file.filename}`,
    };
  }
}
