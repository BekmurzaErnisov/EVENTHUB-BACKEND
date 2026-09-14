import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import { CreateEventDto } from './dto/create-event.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>,
  ) {}

  async create(createEventDto: CreateEventDto, organizerId: string): Promise<Event> {
    const { categoryId, ...eventDetails } = createEventDto;

    const event = this.eventsRepository.create({
      ...eventDetails,
      date: new Date(createEventDto.date),
      organizer: { id: organizerId },
      category: categoryId ? { id: categoryId } : undefined,
    });

    return this.eventsRepository.save(event);
  }
}