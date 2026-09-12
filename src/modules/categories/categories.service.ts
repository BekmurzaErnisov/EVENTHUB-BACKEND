import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesService implements OnModuleInit {
  private readonly initialCategories = [
    'Конференции',
    'Концерты',
    'Спорт',
    'Образование',
    'Другое',
  ];

  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  async onModuleInit(): Promise<void> {
    for (const name of this.initialCategories) {
      const category = await this.categoriesRepository.findOneBy({ name });

      if (!category) {
        await this.categoriesRepository.save({ name });
      }
    }
  }

  findAll(): Promise<Category[]> {
    return this.categoriesRepository.find({ order: { name: 'ASC' } });
  }
}
