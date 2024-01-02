import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@Controller('categories')
@ApiTags('Category')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    await this.categoriesService.create(createCategoryDto);
  }
  @Get('count')
  communityCount() {
    return this.categoriesService.countCommunity();
  }
  @Get()
  findAll(@Query() query?: any) {
    return this.categoriesService.findAll(query);
  }
  @Patch(':id/edit')
  edit(@Param('id') id: string, @Body() body: any) {
    return this.categoriesService.edit(id, body);
  }
}
