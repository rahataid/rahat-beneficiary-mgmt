import { Injectable } from '@nestjs/common';
import { PrismaService } from '@rumsan/prisma';
import { Prisma } from '@prisma/client';
import { paginate } from '../utils/paginate';
import { CreateGroupDto, UpdateGroupDto } from '@community-tool/extentions';
import { generateExcelData } from '../utils/export-to-excel';
import { Response } from 'express';

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
    return await this.prisma.group.create({
      data: dto,
    });
  }

  async findAll(query: any) {
    const select: Prisma.GroupSelect = {
      name: true,
      uuid: true,
      id: true,
      beneficiariesGroup: {
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

  findOne(uuid: string) {
    return this.prisma.group.findUnique({
      where: {
        uuid,
      },
      select: {
        beneficiariesGroup: {
          include: {
            beneficiary: true,
          },
        },
        name: true,
      },
    });
  }

  async update(uuid: string, dto: UpdateGroupDto) {
    return await this.prisma.group.update({
      where: {
        uuid,
      },
      data: dto,
    });
  }

  remove(uuid: string) {
    return this.prisma.group.delete({
      where: {
        uuid,
      },
    });
  }

  downloadData(data: any[], res: Response) {
    const excelBuffer = generateExcelData(data);
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=beneficiaries.xlsx',
    );
    return res.send(excelBuffer);
  }
}
