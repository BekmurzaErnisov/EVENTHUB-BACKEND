import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEventDto } from './dto/create-event.dto';
import { Event } from './entities/event.entity';
import { GetEventQueryDto } from './dto/get-event.dto';

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

  async findAll(query: GetEventQueryDto): Promise<Event[]> {
    const { categoryId, search } = query
    const queryBilder = this.eventsRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.category', 'category')
      .leftJoinAndSelect('event.organizer', 'organizer')

    if(categoryId) {
      queryBilder.andWhere('category.id = :categoryId', { categoryId })
    }

    if (search) {
      queryBilder.andWhere('event.title ILike :search', {
        search: `%${search}%`
      })
    }

    return queryBilder.getMany()
  }
}
