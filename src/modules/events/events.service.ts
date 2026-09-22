import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { Express } from 'express';
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
    const { categoryId, search, sort } = query;
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
      const safeSearch = search.replace(/[%_\\]/g, '\\$&');
      queryBuilder.andWhere(`event.title ILIKE :search ESCAPE '\\'`, {
        search: `%${safeSearch}%`,
      });
    }

    switch (sort) {
      case 'title':
        queryBuilder.orderBy('event.title', 'ASC');
        break;
      case 'newest':
        queryBuilder.orderBy('event.date', 'DESC');
        break;
      case 'added':
        queryBuilder.orderBy('event.createdAt', 'DESC');
        break;
      case 'oldest':
      case 'nearest':
      default:
        queryBuilder.orderBy('event.date', 'ASC');
    }
    queryBuilder.addOrderBy('event.id', 'ASC');

    const total = await queryBuilder.clone().getCount();
    const events = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    const ids = events.map((event) => event.id);
    const counts = new Map<string, number>();
    if (ids.length > 0) {
      const rows = await this.registrationsRepository
        .createQueryBuilder('registration')
        .select('registration.eventId', 'eventId')
        .addSelect('COUNT(*)', 'count')
        .where('registration.eventId IN (:...ids)', { ids })
        .groupBy('registration.eventId')
        .getRawMany<{ eventId: string; count: string }>();

      for (const row of rows) {
        counts.set(row.eventId, Number(row.count));
      }
    }

    for (const event of events) {
      event.registeredCount = counts.get(event.id) ?? 0;
    }

    return {
      events: events.map((event) => this.presentEvent(event)),
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

  const isJoined = Boolean(
    userId && event.registrations?.some((reg) => reg.userId === userId),
  );

  return this.presentEvent(event, { isJoined });
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

  private presentEvent(event: Event, extra: Record<string, unknown> = {}) {
    const { registrations, organizer, ...eventData } = event;
    const registeredCount = event.registeredCount ?? registrations?.length ?? 0;

    return {
      ...eventData,
      organizer: organizer
        ? {
            id: organizer.id,
            name: organizer.name,
            avatarUrl: organizer.avatarUrl,
          }
        : null,
      registeredCount,
      availableSeats: Math.max(0, Number(event.capacity) - registeredCount),
      ...extra,
    };
  }

}
