import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CategoriesService } from './categories.service';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {

  constructor(private readonly categoriesService: CategoriesService) {}

  @ApiOperation({ summary: 'Получить список категорий' })
  @ApiResponse({ status: 200, description: 'Список категорий успешно получен' })
  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

}