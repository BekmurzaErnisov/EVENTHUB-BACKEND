import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, QueryFailedError, Repository } from 'typeorm';

import { Registration } from './entities/registration.entity';
import { Event } from '../events/entities/event.entity';

@Injectable()
export class RegistrationsService {
  constructor(
    @InjectRepository(Registration)
    private readonly registrationsRepository: Repository<Registration>,

    private readonly dataSource: DataSource,
  ) {}

  async register(eventId: string, userId: string) {
    try {
      return await this.dataSource.transaction(async (manager) => {
        const event = await manager
          .createQueryBuilder(Event, 'event')
          .setLock('pessimistic_write')
          .where('event.id = :id', { id: eventId })
          .getOne();

        if (!event) {
          throw new NotFoundException('Мероприятие не найдено');
        }

        if (event.date.getTime() <= Date.now()) {
          throw new BadRequestException('Нельзя записаться на прошедшее мероприятие');
        }

        const existingRegistration = await manager.findOne(Registration, {
          where: { eventId, userId },
        });

        if (existingRegistration) {
          throw new ConflictException('Вы уже зарегистрированы на это мероприятие');
        }

        const registrationsCount = await manager.count(Registration, {
          where: { eventId },
        });

        if (event.capacity <= 0 || registrationsCount >= event.capacity) {
          throw new ConflictException('Все места на мероприятие уже заняты');
        }

        const registration = manager.create(Registration, { eventId, userId });
        return manager.save(registration);
      });
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error as QueryFailedError & { driverError?: { code?: string } }).driverError
          ?.code === '23505'
      ) {
        throw new ConflictException('Вы уже зарегистрированы на это мероприятие');
      }
      throw error;
    }
  }

  async findUserRegistrations(userId: string) {
    const registrations = await this.registrationsRepository.find({
      where: { user: { id: userId } },
      relations: {
        event: {
          category: true,
          organizer: true,
        },
      },
    });

    return registrations
      .map((registration) => registration.event)
      .filter((event): event is Event => Boolean(event))
      .map((event) => ({
        id: event.id,
        title: event.title,
        description: event.description,
        date: event.date,
        location: event.location,
        price: event.price,
        capacity: event.capacity,
        imageUrl: event.imageUrl,
        category: event.category ? { id: event.category.id, name: event.category.name } : null,
        organizer: event.organizer
          ? {
              id: event.organizer.id,
              name: event.organizer.name,
              avatarUrl: event.organizer.avatarUrl,
            }
          : null,
      }));
  }

  async unregister(eventId: string, userId: string) {
    const registration = await this.registrationsRepository.findOne({
      where: {
        event: { id: eventId },
        user: { id: userId },
      },
    });

    if (!registration) {
      throw new NotFoundException('Вы не были записаны на это мероприятие');
    }

    await this.registrationsRepository.remove(registration);

    return { message: 'Запись на мероприятие успешно отменена' };
  }
}
