import { Injectable } from '@nestjs/common';
import {
  CreateBeneficiaryGroupDto,
  ListBeneficiaryGroupDto,
  UpdateBeneficiaryGroupDto,
} from '@rahataid/community-tool-extensions';
import { GroupOrigins } from '@rahataid/community-tool-sdk';
import { RSError } from '@rumsan/core';
import { PrismaService } from '@rumsan/prisma';
import { UUID } from 'crypto';
import { paginate } from '../utils/paginate';
import { InjectQueue } from '@nestjs/bull';
import { JOBS, QUEUE } from '../../constants';
import { Queue } from 'bull';

const BATCH_SIZE = 50;

@Injectable()
export class BeneficiaryGroupService {
  constructor(
    @InjectQueue(QUEUE.BENEFICIARY) private benefQueue: Queue,
    private prisma: PrismaService,
  ) {}

  hasOrigins(arr: any) {
    return arr.includes(GroupOrigins.IMPORT && GroupOrigins.TARGETING);
  }

  async create(dto: CreateBeneficiaryGroupDto) {
    const currentGroup = await this.findGroupByUUID(dto.groupUID);

    const totalBeneficiaries = dto.beneficiaryUID.length;

    await this.benefQueue.add(JOBS.CREATE_BENEF_GROUP, {
      ...dto,
    });

    return {
      finalMessage: `${totalBeneficiaries} beneficiaries assigned to ${currentGroup.name} group`,
    };
  }

  async createBeneficiaryGroup(dto: CreateBeneficiaryGroupDto) {
    const totalBeneficiaries = dto.beneficiaryUID.length;
    for (let i = 0; i < totalBeneficiaries; i += BATCH_SIZE) {
      const currentBatch = dto.beneficiaryUID.slice(i, i + BATCH_SIZE);

      for (const beneficiaryUUID of currentBatch) {
        await this.prisma.beneficiaryGroup.upsert({
          where: {
            benefGroupIdentifier: {
              beneficiaryUID: beneficiaryUUID,
              groupUID: dto.groupUID,
            },
          },
          update: {
            beneficiaryUID: beneficiaryUUID,
            groupUID: dto.groupUID,
          },
          create: {
            beneficiaryUID: beneficiaryUUID,
            groupUID: dto.groupUID,
          },
        });
      }
    }
  }

  async findGroupByUUID(uuid: UUID) {
    return this.prisma.group.findUnique({
      where: {
        uuid: uuid,
      },
      select: {
        name: true,
        origins: true,
      },
    });
  }

  async findAll(filters: ListBeneficiaryGroupDto) {
    return paginate(
      this.prisma.beneficiaryGroup,
      { where: {} },
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

  async removeBeneficiaryFromGroup(benefUID: string, uuid: string) {
    return this.prisma.beneficiaryGroup.deleteMany({
      where: {
        groupUID: uuid,
        beneficiaryUID: benefUID,
      },
    });
  }

  async removeBenefFromMultipleGroups(benefUID: string) {
    return this.prisma.beneficiaryGroup.deleteMany({
      where: {
        beneficiaryUID: benefUID,
      },
    });
  }

  upsertBeneficiaryGroup(beneficiary: string, group: string) {
    const payload = {
      beneficiaryUID: beneficiary,
      groupUID: group,
    };
    return this.prisma.beneficiaryGroup.upsert({
      where: {
        benefGroupIdentifier: payload,
      },
      update: payload,
      create: payload,
    });
  }
}
