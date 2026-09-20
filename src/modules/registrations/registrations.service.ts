import {ConflictException,Injectable, NotFoundException,} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Registration } from './entities/registration.entity';
import { Event } from '../events/entities/event.entity';

@Injectable()
export class RegistrationsService {
  constructor(
    @InjectRepository(Registration)
    private readonly registrationsRepository: Repository<Registration>,

    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>,
  ) {}

  async register(eventId: string, userId: string) {
    const event = await this.eventsRepository.findOne({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Мероприятие не найдено');
    }

    const existingRegistration =
      await this.registrationsRepository.findOne({
        where: {
          eventId,
          userId,
        },
      });

    if (existingRegistration) {
      throw new ConflictException(
        'Вы уже зарегистрированы на это мероприятие',
      );
    }

    const registrationsCount =
      await this.registrationsRepository.count({
        where: { eventId },
      });

    if (registrationsCount >= event.capacity) {
      throw new ConflictException(
        'Все места на мероприятие уже заняты',
      );
    }

    const registration = this.registrationsRepository.create({
      eventId,
      userId,
    });

    return this.registrationsRepository.save(registration);
  }

  async findUserRegistrations(userId: string) {
  const registrations = await this.registrationsRepository.find({
    where: { user: { id: userId } },
    relations: {
      event: {
        category: true,
        organizer: true,
      }
    },
  });

  return registrations.map((registration) => registration.event);
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