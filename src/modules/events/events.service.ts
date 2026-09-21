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
import { Category } from '../categories/entities/category.entity';
import { Registration } from '../registrations/entities/registration.entity';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>,
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
    @InjectRepository(Registration)
    private readonly registrationsRepository: Repository<Registration>,
  ) {}

  async create(createEventDto: CreateEventDto, organizerId: string): Promise<Event> {
    const { categoryId, ...eventData } = createEventDto;
    const category = categoryId
      ? await this.categoriesRepository.findOne({ where: { id: categoryId } })
      : null;

    if (categoryId && !category) {
      throw new NotFoundException('Категория не найдена');
    }

    const event = this.eventsRepository.create({
      ...eventData,
      date: new Date(createEventDto.date),
      organizer: { id: organizerId },
      ...(category ? { category } : {}),
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

    const { title, description, date, location, price, capacity, imageUrl, categoryId } = updateEventDto;
    const category = categoryId
      ? await this.categoriesRepository.findOne({ where: { id: categoryId } })
      : undefined;

    if (categoryId && !category) {
      throw new NotFoundException('Категория не найдена');
    }

    Object.assign(event, {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(date !== undefined && { date: new Date(date) }),
      ...(location !== undefined && { location }),
      ...(price !== undefined && { price }),
      ...(capacity !== undefined && { capacity }),
      ...(imageUrl !== undefined && { imageUrl }),
      ...(category !== undefined && { category }),
    });

    return this.eventsRepository.save(event);
  }

  async findAll(query: GetEventQueryDto) {
    const { categoryId, search } = query;
    const page = query.page || 1;
    const limit = query.limit || 12;

    const queryBuilder = this.eventsRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.category', 'category')
      .leftJoinAndSelect('event.organizer', 'organizer');

    if (categoryId !== undefined) {
      queryBuilder.andWhere('category.id = :categoryId', {
        categoryId: Number(categoryId),
      });
    }

    if (search) {
      queryBuilder.andWhere('event.title ILike :search', {
        search: `%${search}%`,
      });
    }

    const total = await queryBuilder.getCount();
    const events = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      events: await Promise.all(events.map(async (event) => {
        const registeredCount = await this.registrationsRepository.count({
          where: { eventId: event.id },
        });

        return {
          ...event,
          registeredCount,
          availableSeats: Math.max(0, event.capacity - registeredCount),
        };
      })),
      total,
      page,
      hasMore: page * limit < total,
    };
  }

  async findOne(id: string, userId?: string) {
  const event = await this.eventsRepository.findOne({
    where: { id },
    relations: {
      category: true,
      organizer: true,
      registrations: true,
    },
  });

  if (!event) {
    throw new NotFoundException('Мероприятие не найдено');
  }

  const isJoined = userId && event.registrations
    ? event.registrations.some((reg) => reg.userId === userId)
    : false;

  const { registrations, ...eventData } = event;
  const registeredCount = registrations?.length || 0;

  return {
    ...eventData,
    registeredCount,
    availableSeats: Math.max(0, event.capacity - registeredCount),
    isJoined,
  };
}

  async findByOrganizer(organizerId: string): Promise<Event[]> {
    return this.eventsRepository.find({
      where: { organizer: { id: organizerId } },
      relations: {
        category: true,
      },
      order: { createdAt: 'DESC'}
    })
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

  handleImageUpload(file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Файл не был передан')
    }

    return {
      imageUrl: `/uploads/${file.filename}`
    }
  }

}
