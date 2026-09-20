import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateCategoryDto } from './dto/update-category.dto';
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
        const newCategory = this.categoriesRepository.create({ name });
        await this.categoriesRepository.save(newCategory);
      }
    }
  }

  findAll(): Promise<Category[]> {
    return this.categoriesRepository.find({ order: { name: 'ASC' } });
  }

  async findOne(id: number): Promise<Category> {
    const category = await this.categoriesRepository.findOneBy({ id });

    if (!category) {
      throw new NotFoundException('Категория не найдена');
    }

    return category;
  }

  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.findOne(id);

    Object.assign(category, updateCategoryDto);
    return this.categoriesRepository.save(category);
  }

  async remove(id: number): Promise<void> {
    const category = await this.findOne(id);
    await this.categoriesRepository.remove(category);
  }
}
