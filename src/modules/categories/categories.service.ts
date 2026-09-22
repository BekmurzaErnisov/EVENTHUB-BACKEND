import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DEFAULT_CATEGORIES } from './categories.constants';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesService implements OnModuleInit {
  private readonly initialCategories = DEFAULT_CATEGORIES;

  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  async onModuleInit(): Promise<void> {
    for (const name of this.initialCategories) {
      const category = await this.categoriesRepository.findOneBy({ name });

      if (!category) {
        const newCategory = this.categoriesRepository.create({ name })
        await this.categoriesRepository.save(newCategory);
      }
    }
  }

  findAll(): Promise<Category[]> {
    return this.categoriesRepository.find({ order: { name: 'ASC' } });
  }

  async findOne(id: number): Promise<Category> {
    const category = await this.categoriesRepository.findOneBy({ id })

    if(!category) {
      throw new NotFoundException('Категория не найдена')
    }

    return category
  }
}
