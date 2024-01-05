import { Injectable } from '@nestjs/common';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { PrismaService } from '@rahat/prisma';
import { Prisma } from '@prisma/client';
import { paginate } from '../utils/paginate';

@Injectable()
export class GroupService {
  constructor(private prisma: PrismaService) {}
  async create(dto: CreateGroupDto) {
    const check = await this.prisma.group.findUnique({
      where: {
        name: dto.name,
      },
    });

    if (check) throw new Error('Already inserted');

    await this.prisma.group.create({
      data: dto,
    });
    return 'Created Succesfully';
  }

  async findAll(query: any) {
    const select: Prisma.GroupSelect = {
      name: true,
      id: true,
      beneficiaries_group: {
        select: {
          beneficiary: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              gender: true,
              email: true,
              uuid: true,
            },
          },
        },
      },
    };

    return paginate(
      this.prisma.group,
      {
        select,
      },
      {
        page: query.page,
        perPage: query.perPage,
      },
    );
  }

  findOne(id: number) {
    return this.prisma.group.findUnique({
      where: {
        id,
      },
      select: {
        beneficiaries_group: {
          include: {
            beneficiary: true,
          },
        },
        name: true,
      },
    });
  }

  async update(id: number, dto: UpdateGroupDto) {
    await this.prisma.group.update({
      where: {
        id,
      },
      data: dto,
    });
  }

  remove(id: number) {
    return `This action removes a #${id} group`;
  }
}
