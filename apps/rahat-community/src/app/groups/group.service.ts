import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Prisma } from '@prisma/client';
import {
  CreateGroupDto,
  ListGroupDto,
  UpdateGroupDto,
} from '@rahataid/community-tool-extensions';
import {
  ArchiveType,
  BeneficiaryEvents,
  VERIFICATION_ADDRESS_SETTINGS_NAME,
} from '@rahataid/community-tool-sdk';
import { PrismaService } from '@rumsan/prisma';
import { BeneficiariesService } from '../beneficiaries/beneficiaries.service';
import { BeneficiaryGroupService } from '../beneficiary-groups/beneficiary-group.service';
import { generateExcelData } from '../utils/export-to-excel';
import { paginate } from '../utils/paginate';
import { VerificationService } from '../beneficiaries/verification.service';

@Injectable()
export class GroupService {
  constructor(
    private prisma: PrismaService,
    private beneficaryGroupService: BeneficiaryGroupService,
    private beneficaryService: BeneficiariesService,
    private verificationService: VerificationService,
    private eventEmitter: EventEmitter2,
  ) {}
  async create(dto: CreateGroupDto) {
    return await this.prisma.group.create({
      data: dto,
    });
  }

  findOneByName(name: string) {
    return this.prisma.group.findUnique({ where: { name } });
  }

  async upsertByName(dto: any) {
    const k = await this.prisma.group.upsert({
      where: {
        name: dto.name,
      },
      update: dto,
      create: dto,
    });
    return k;
  }

  async findAll(query: ListGroupDto) {
    const AND_CONDITIONS = [];
    let conditions = {};

    if (query.name) {
      AND_CONDITIONS.push({
        name: { contains: query.name, mode: 'insensitive' },
      });
      conditions = { AND: AND_CONDITIONS };
    }

    if (query.hasOwnProperty('autoCreated')) {
      AND_CONDITIONS.push({
        autoCreated: query.autoCreated,
      });
      conditions = { AND: AND_CONDITIONS };
    }

    const select: Prisma.GroupSelect = {
      name: true,
      uuid: true,
      id: true,
      autoCreated: true,
      user: {
        select: { name: true },
      },
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
        orderBy: { createdAt: 'desc' },
        select,
      },
      {
        page: query.page,
        perPage: query.perPage,
      },
    );
  }

  async findOne(uuid: string, query?: ListGroupDto) {
    const group = await this.prisma.group.findUnique({
      where: { uuid },
      select: {
        name: true,
        beneficiariesGroup: {
          select: {
            beneficiary: true,
          },
        },
      },
    });
    if (query && query.page && query.perPage) {
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
            beneficiary: true,
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

  async remove(
    uuid: string,
    deleteBeneficiaryFlag: boolean,
    beneficiaryUuid: string[],
  ) {
    const group = await this.findUnique(uuid);
    if (!group) throw new Error('Group not found');
    if (group) {
      for (const item of beneficiaryUuid) {
        await this.beneficaryGroupService.removeBeneficiaryFromGroup(
          item,
          uuid,
        );

        if (deleteBeneficiaryFlag) {
          await this.beneficaryService.update(item, {
            archived: true,
          });
        }
      }
    }

    return 'Beneficiary removed successfully!';
  }

  async downloadData(uuid: string) {
    const getGrouppedBeneficiary = await this.findOne(uuid);
    const groupName = getGrouppedBeneficiary.name;

    const formattedData = getGrouppedBeneficiary.beneficiariesGroup.map(
      (item) => {
        const { firstName, lastName, ...rest } = item.beneficiary;

        return {
          ...rest,
          householdHeadName: `${firstName} ${lastName}`,
          groupName,
        };
      },
    );

    const excelData = generateExcelData(formattedData);
    // res.setHeader(
    //   'Content-Type',
    //   'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    // );
    // res.setHeader(
    //   'Content-Disposition',
    //   'attachment; filename=beneficiaries.xlsx',
    // );
    // return res.send(excelBuffer);

    return excelData;
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

  // Delete beneficiary permanently
  async purgeGroup(groupUuid: string, beneficiaryUuid: string[]) {
    const group = await this.findUnique(groupUuid);
    if (!group) throw new Error('Group not found');
    group.uuid &&
      (await this.prisma.$transaction(async (prisma) => {
        for (const item of beneficiaryUuid) {
          // Delete from the group table (tbl_beneficiary_groups)
          await prisma.beneficiaryGroup.deleteMany({
            where: {
              beneficiaryUID: item,
            },
          });

          // Remove benef from targetResult
          await prisma.targetResult.deleteMany({
            where: {
              benefUuid: item,
            },
          });

          // Delete beneficiary from the beneficiary source (tbl_beneficiary_source)

          await prisma.beneficiarySource.deleteMany({
            where: {
              beneficiaryUID: item,
            },
          });
          // delete beneficiary from the beneficiary table (tbl_beneficiaries)
          const deletedBeneficiary = await prisma.beneficiary.delete({
            where: {
              uuid: item,
            },
          });

          // add to archive beneficiary table (tbl_archive_beneficiaries)

          await this.archiveDeletedBeneficiary(
            deletedBeneficiary,
            ArchiveType.DELETED,
          );
        }
      }));

    this.eventEmitter.emit(BeneficiaryEvents.BENEFICIARY_REMOVED);
    return 'Group purged successfully!';
  }

  async deleteGroup(groupUuid: string) {
    const groupList = await this.prisma.group.findUnique({
      where: {
        uuid: groupUuid,
      },
      select: {
        isSystem: true,
        _count: {
          select: {
            beneficiariesGroup: true,
          },
        },
      },
    });

    if (!groupList) throw new Error('Group not found!');
    if (groupList.isSystem) throw new Error('System group cannot be deleted!');
    if (groupList._count.beneficiariesGroup > 0)
      throw new Error('Cannot delete group with active beneficiaries!');

    await this.prisma.group.delete({
      where: {
        uuid: groupUuid,
      },
    });
    return 'Group deleted successfully!';
  }

  async getVerificationApp() {
    return this.prisma.setting.findFirst({
      where: {
        name: VERIFICATION_ADDRESS_SETTINGS_NAME,
      },
      select: {
        value: true,
      },
    });
  }

  async bulkGenerateLink(groupUID: string) {
    const verificationApp = await this.getVerificationApp();
    if (!verificationApp)
      throw new Error('Please setup verification app first!');
    const rData = await this.findUnique(groupUID);

    const nonEmailBenef = rData.beneficiariesGroup.filter((benef) => {
      return benef.beneficiary.email === null;
    });

    const nonVerifiedBenef = rData.beneficiariesGroup.filter((benefUid) => {
      return (
        benefUid.beneficiary.isVerified === false &&
        benefUid.beneficiary.email !== null
      );
    });

    if (!nonVerifiedBenef.length)
      throw new Error('Did not find non-verified beneficiaries with an email');
    const generateLink = nonVerifiedBenef.map((benefUid) => {
      this.verificationService.generateLink(benefUid.beneficiaryUID);
    });

    await Promise.all(generateLink);

    const emptyEmailMsg =
      nonEmailBenef.length > 0
        ? `${nonEmailBenef.length} beneficiaries dont have an email`
        : '';

    return `Sent verification link to ${nonVerifiedBenef.length} beneficiaries. ${emptyEmailMsg}`;
  }
}
