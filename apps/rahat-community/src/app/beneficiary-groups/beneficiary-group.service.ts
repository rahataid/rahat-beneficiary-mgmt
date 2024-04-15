import {
  CreateBeneficiaryGroupDto,
  UpdateBeneficiaryGroupDto,
} from '@rahataid/community-tool-extensions';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@rumsan/prisma';
import { RSError } from '@rumsan/core';
import { paginate } from '../utils/paginate';
import { Prisma } from '@prisma/client';

@Injectable()
export class BeneficiaryGroupService {
  constructor(private prisma: PrismaService) {}
  async create(dto: CreateBeneficiaryGroupDto) {
    const groupBenefData = await this.prisma.$transaction(async (prisma) => {
      const resultArray = [];
      const errors = [];

      for (const beneficiaryId of dto.beneficiariesId) {
        const data = await prisma.beneficiaryGroup.findFirst({
          where: {
            beneficiaryId: beneficiaryId,
            groupId: dto.groupId,
          },
        });

        if (data) {
          const beneficiaryName = await prisma.beneficiary.findUnique({
            where: {
              id: beneficiaryId,
            },
            select: {
              firstName: true,
              lastName: true,
            },
          });

          errors.push(
            `${beneficiaryName.firstName} ${beneficiaryName.lastName}`,
          );
          continue;
        }

        const createdBenefGroup = await prisma.beneficiaryGroup.create({
          data: {
            beneficiary: {
              connect: {
                id: beneficiaryId,
              },
            },
            group: {
              connect: {
                id: dto.groupId,
              },
            },
          },
        });
        resultArray.push(createdBenefGroup);
      }

      const errorMessage = errors.length > 0 && errors.join(',');

      const groupName = await prisma.group.findUnique({
        where: {
          id: dto.groupId,
        },
        select: {
          name: true,
        },
      });

      const finalResult = {
        finalMessage: `${resultArray.length} beneficiary associated with ${groupName.name}`,
        info:
          errors.length > 0 &&
          `${errorMessage} is already associated with ${groupName.name}`,
      };
      return finalResult;
    });
    return groupBenefData;
  }

  async findAll(filters: any) {
    const select: Prisma.BeneficiaryGroupSelect = {
      beneficiaryId: true,
      groupId: true,
      id: true,
    };
    // return await this.prisma.beneficiaryGroup.findMany({});
    return paginate(
      this.prisma.beneficiaryGroup,
      { select },
      {
        page: +filters?.page,
        perPage: +filters?.perPage,
      },
    );
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
