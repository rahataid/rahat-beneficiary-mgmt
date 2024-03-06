import { Injectable } from '@nestjs/common';
import { CreateBeneficiaryGroupDto } from './dto/create-beneficiary-group.dto';
import { UpdateBeneficiaryGroupDto } from './dto/update-beneficiary-group.dto';
import { PrismaService } from '@rahat/prisma';
import { RSError } from '@rumsan/core';

@Injectable()
export class BeneficiaryGroupService {
  constructor(private prisma: PrismaService) {}
  async create(dto: CreateBeneficiaryGroupDto) {
    const groupBenefData = await this.prisma.$transaction(async (prisma) => {
      const data = await prisma.beneficiaryGroup.findFirst({
        where: {
          beneficiaryId: dto.beneficiaryId,
          groupId: dto.groupId,
        },
      });

      if (data) throw new Error('Already Created');

      const createdBenefGroup = await prisma.beneficiaryGroup.create({
        data: {
          beneficiary: {
            connect: {
              id: dto.beneficiaryId,
            },
          },
          group: {
            connect: {
              id: dto.groupId,
            },
          },
        },
      });
      return createdBenefGroup;
    });

    return groupBenefData;
  }

  async findAll() {
    return await this.prisma.beneficiaryGroup.findMany({});
  }

  async findOne(id: number) {
    await this.prisma.beneficiaryGroup.findUnique({
      where: {
        id,
      },
      select: {
        beneficiary: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            gender: true,
            phone: true,
            notes: true,
            birthDate: true,
          },
        },
        group: {
          select: {
            name: true,
          },
        },
      },
    });
  }

  async update(id: number, dto: UpdateBeneficiaryGroupDto) {
    await this.prisma.beneficiaryGroup.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    const findBenefGroup = await this.prisma.beneficiaryGroup.findUnique({
      where: {
        id,
      },
    });

    if (!findBenefGroup) {
      throw new RSError({
        name: 'Not Found',
        message: 'No Beneficiary Group to Delete',
        type: 'Not Found',
        httpCode: 404,
      });
    }

    return await this.prisma.beneficiaryGroup.delete({
      where: {
        id,
      },
    });
  }
}
