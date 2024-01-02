import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { paginate } from '../utils/paginate';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from '@rahat/prisma';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const { name } = createCategoryDto;
    const category = await this.prisma.category.findMany({
      select: {
        id: true,
      },
    });
    if (category.length > 0) {
      const len = category[category.length - 1];
      await this.prisma.category.create({
        data: {
          id: len.id + 1,
          name: name,
        },
      });
      return { message: 'Category created Successfully', status: 201 };
    }

    await this.prisma.category.create({
      data: {
        name: name,
      },
    });
    return { message: 'Category created Successfully', status: 201 };
  }

  // findAll() {
  //   return this.prisma.category.findMany();
  // }

  findAll(query: any) {
    const where: Prisma.CategoryWhereInput = {};

    if (query.name) {
      where.name = {
        contains: query.name,
        mode: 'insensitive',
      };
    }

    const select: Prisma.CategorySelect = {
      name: true,
      id: true,
    };
    const orderBy: Prisma.CategoryOrderByWithRelationInput = {
      name: 'asc',
    };

    return paginate(
      this.prisma.category,
      { where, select, orderBy },
      {
        page: query.page,
        perPage: query.perPage,
      }
    );
  }
  async edit(id: string, updateCategories: UpdateCategoryDto) {
    await this.prisma.category.update({
      where: {
        id: parseInt(id),
      },
      data: {
        ...updateCategories,
      },
    });
  }

  async countCommunity() {
    return await this.prisma.category.findMany({
      select: {
        name: true,
        communities: {
          select: {
            name: true,
          },
        },
        _count: true,
      },
    });
  }
}
