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
import { BeneficiaryGroupService } from '../beneficiary-groups/beneficiary-group.service';
import { BeneficiariesService } from '../beneficiaries/beneficiaries.service';
import { BeneficiarySourceService } from '../beneficiary-sources/beneficiary-source.service';
import { ArchiveType } from '@rahataid/community-tool-sdk';

@Injectable()
export class GroupService {
  constructor(
    private prisma: PrismaService,
    private beneficaryGroupService: BeneficiaryGroupService,
    private beneficaryService: BeneficiariesService,
    private beneficarySourceService: BeneficiarySourceService,
  ) {}
  async create(dto: CreateGroupDto) {
    const exist = await this.findOneByName(dto.name);
    if (exist) throw new Error('Group alread exist!');
    return await this.prisma.group.create({
      data: dto,
    });
  }

  findOneByName(name: string) {
    return this.prisma.group.findUnique({ where: { name } });
  }

  upsertByName(dto: CreateGroupDto) {
    return this.prisma.group.upsert({
      where: {
        name: dto.name,
      },
      update: dto,
      create: dto,
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

    return paginate(
      this.prisma.group,
      {
        where: { ...conditions },
        select,
      },
      {
        page: query.page,
        perPage: query.perPage,
      },
    );
  }

  async findOne(uuid: string, query: ListGroupDto) {
    const group = await this.prisma.group.findUnique({
      where: { uuid },
      select: {
        beneficiariesGroup: {
          select: {
            beneficiary: true,
          },
        },
      },
    });
    if (query.page && query.perPage) {
      const startIndex = (query.page - 1) * query.perPage;
      const endIndex = query.page * query.perPage;
      const paginatedBeneficiaries = group.beneficiariesGroup.slice(
        startIndex,
        endIndex,
      );
      const total = group.beneficiariesGroup.length;
      const lastPage = Math.ceil(total / query.perPage);

      const meta = {
        total,
        lastPage,
        currentPage: query.page,
        perPage: query.perPage,
      };

      return {
        ...group,
        beneficiariesGroup: paginatedBeneficiaries,
        meta,
      };
    }
    return group;
  }

  findUnique(uuid: string) {
    return this.prisma.group.findUnique({
      where: {
        uuid,
      },
      select: {
        beneficiariesGroup: {
          select: {
            uuid: true,
            groupUID: true,
            beneficiaryUID: true,
          },
        },
        uuid: true,
        isSystem: true,
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
    const group = await this.findUnique(uuid);
    if (group?.beneficiariesGroup?.length > 0) {
      await this.prisma.$transaction(async (prisma) => {
        for (const item of group.beneficiariesGroup) {
          // Delete from the group table (tbl_beneficiary_groups)
          await this.beneficaryGroupService.removeBeneficiaryFromGroup(
            item.beneficiaryUID,
            group.uuid,
          );

          if (deleteBeneficiaryFlag) {
            // Update archive flag of beneficiary from tbl_beneficiaries
            await this.beneficaryService.update(item.beneficiaryUID, {
              archived: true,
            });
          }
        }
      });
    }
    return 'Beneficiary removed successfully!';
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

  async archiveDeletedBeneficiary(beneficiary: any, flag: string) {
    beneficiary.archiveType = flag;
    return this.prisma.beneficiaryArchive.upsert({
      where: { uuid: beneficiary.uuid },
      update: beneficiary,
      create: beneficiary,
    });
  }

  removeMultipleBenefFromTargetResult(benefUuid: string) {
    return this.prisma.targetResult.deleteMany({
      where: {
        benefUuid,
      },
    });
  }

  async purgeGroup(uuid: string) {
    const group = await this.findUnique(uuid);
    if (!group) throw new Error('Group not found');
    if (group.isSystem) throw new Error('System group cannot be purged!');

    if (group?.beneficiariesGroup?.length > 0) {
      await this.prisma.$transaction(async (prisma) => {
        for (const item of group.beneficiariesGroup) {
          // Delete benef from the group table (tbl_beneficiary_groups)
          await this.beneficaryGroupService.removeBenefFromMultipleGroups(
            item.beneficiaryUID,
          );

          // Remove benef from targetResult
          await this.removeMultipleBenefFromTargetResult(item.beneficiaryUID);

          // Delete beneficiary from the beneficiary source (tbl_beneficiary_source)
          await this.beneficarySourceService.removeBeneficiaryFromSource(
            item.beneficiaryUID,
          );

          // delete beneficiary from the beneficiary table (tbl_beneficiaries)
          const deletedBeneficiary =
            await this.beneficaryService.deletePermanently(item.beneficiaryUID);

          // add to archive beneficiary table (tbl_archive_beneficiaries)
          await this.archiveDeletedBeneficiary(
            deletedBeneficiary,
            ArchiveType.DELETED,
          );
        }
      });
    }

    // finally delete group
    return await this.prisma.group.delete({
      where: {
        uuid,
      },
    });
  }
}
