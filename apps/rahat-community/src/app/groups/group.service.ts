import { Injectable } from '@nestjs/common';
import { PrismaService } from '@rumsan/prisma';
import { Prisma } from '@prisma/client';
import { paginate } from '../utils/paginate';
import {
  CreateGroupDto,
  ListGroupDto,
  UpdateGroupDto,
} from '@rahataid/community-tool-extensions';
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

  async findAll(query: ListGroupDto) {
    const OR_CONDITIONS = [];
    let conditions = {};

    if (OR_CONDITIONS.length) conditions = { OR: OR_CONDITIONS };

    if (query.name) {
      OR_CONDITIONS.push({
        name: { contains: query.name, mode: 'insensitive' },
      });
      conditions = { OR: OR_CONDITIONS };
    }

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

    let where: any = {};
    if (query.name) {
      where = {
        name: {
          contains: query.name,
          mode: 'insensitive',
        },
      };
    }

    return paginate(
      this.prisma.group,
      {
        where: { ...conditions },
        select,
        where,
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

  async remove(uuid: string, deleteBeneficiaryFlag: boolean) {
    // get relevant informationn from the group table
    const getInfo = await this.prisma.group.findUnique({
      where: {
        uuid,
      },
      select: {
        beneficiariesGroup: {
          select: {
            id: true,
            groupId: true,
            beneficiaryId: true,
          },
        },
      },
    });

    if (getInfo?.beneficiariesGroup?.length > 0) {
      await this.prisma.$transaction(async (prisma) => {
        for (const item of getInfo.beneficiariesGroup) {
          // first delete from the combine table (tbl_beneficiary_groups)

          await prisma.beneficiaryGroup.deleteMany({
            where: {
              beneficiaryId: item.beneficiaryId,
            },
          });

          if (deleteBeneficiaryFlag) {
            // delete beneficiary from the beneficiary table (tbl_beneficiaries)
            await prisma.beneficiary.delete({
              where: {
                id: item?.beneficiaryId,
              },
            });
          }
        }
      });
    }

    return 'Beneficiaries and their associations were successfully removed from the group.';
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
