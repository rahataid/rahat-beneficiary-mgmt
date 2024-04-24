import {
  CreateBeneficiaryGroupDto,
  UpdateBeneficiaryGroupDto,
} from '@rahataid/community-tool-extensions';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@rumsan/prisma';
import { RSError } from '@rumsan/core';
import { paginate } from '../utils/paginate';
import { Prisma } from '@prisma/client';

// Fix the DTOs/Types and Service functions
@Injectable()
export class BeneficiaryGroupService {
  constructor(private prisma: PrismaService) {}
  async create(dto: CreateBeneficiaryGroupDto) {
    const groupBenefData = await this.prisma.$transaction(async (prisma) => {
      const resultArray = [];
      const errors = [];
      for (const beneficiaryUUID of dto.beneficiaryUID) {
        const data = await prisma.beneficiaryGroup.findFirst({
          where: {
            beneficiaryUID: beneficiaryUUID,
            groupUID: dto.groupUID,
          },
        });
        if (data) {
          const beneficiaryName = await prisma.beneficiary.findUnique({
            where: {
              uuid: beneficiaryUUID,
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
                uuid: beneficiaryUUID,
              },
            },
            group: {
              connect: {
                uuid: dto.groupUID,
              },
            },
          },
        });
        resultArray.push(createdBenefGroup);
      }
      const errorMessage = errors.length > 0 && errors.join(',');
      const groupName = await prisma.group.findUnique({
        where: {
          uuid: dto.groupUID,
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
    const select: Prisma.BeneficiaryGroupSelect = {};
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

  async findOne(uuid: string) {
    return await this.prisma.beneficiaryGroup.findUnique({
      where: {
        uuid,
      },
      select: {
        beneficiary: {
          select: {
            uuid: true,
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
            uuid: true,
            name: true,
          },
        },
      },
    });
  }

  async update(uuid: string, dto: UpdateBeneficiaryGroupDto) {
    return await this.prisma.beneficiaryGroup.update({
      where: { uuid },
      data: {},
    });
  }

  async remove(uuid: string) {
    const findBenefGroup = await this.prisma.beneficiaryGroup.findUnique({
      where: {
        uuid,
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
        uuid,
      },
    });
  }

  async removeBeneficiaryFromGroup(uuid: string) {
    await this.prisma.beneficiaryGroup.deleteMany({
      where: {
        uuid,
      },
    });
  }
}
