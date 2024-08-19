import { Injectable, Req } from '@nestjs/common';

import { InjectQueue } from '@nestjs/bull';
import { Prisma } from '@prisma/client';
import {
  CreateTargetQueryDto,
  CreateTargetResultDto,
  ExportTargetBeneficiaryDto,
  ListTargetQueryDto,
  ListTargetUIDDto,
  TargetQueryStatusEnum,
  updateTargetQueryLabelDTO,
} from '@rahataid/community-tool-extensions';
import { PrismaService } from '@rumsan/prisma';
import { Queue } from 'bull';
import { UUID } from 'crypto';
import {
  APP,
  DB_MODELS,
  EVENTS,
  JOBS,
  QUEUE,
  QUEUE_RETRY_OPTIONS,
  TARGET_QUERY_STATUS,
} from '../../constants';
import { BeneficiariesService } from '../beneficiaries/beneficiaries.service';
import { filterExtraFieldValues } from '../beneficiaries/helpers';
import { fetchSchemaFields } from '../beneficiary-import/helpers';
import { calculateNumberOfDays, getBaseUrl } from '../utils';
import { generateExcelData } from '../utils/export-to-excel';
import { paginate } from '../utils/paginate';
import {
  checkPublicKey,
  createFinalResult,
  createPrimaryAndExtraQuery,
  exportBulkBeneficiary,
  generateSignature,
} from './helpers';
import { GroupService } from '../groups/group.service';
import { GroupOrigins, SETTINGS_NAMES } from '@rahataid/community-tool-sdk';
import { EventEmitter2 } from '@nestjs/event-emitter';

const EXPORT_BATCH_SIZE = 500;

@Injectable()
export class TargetService {
  constructor(
    @InjectQueue(QUEUE.TARGETING) private targetingQueue: Queue,
    @InjectQueue(QUEUE.BENEFICIARY) private benefQueue: Queue,
    private eventEmitter: EventEmitter2,
    private prismaService: PrismaService,
    private benefService: BeneficiariesService,
    private groupService: GroupService,
  ) {}

  async create(dto: CreateTargetQueryDto) {
    const { filterOptions } = dto;
    const target = await this.prismaService.targetQuery.create({ data: dto });
    const data = { targetUuid: target.uuid, filterOptions };
    this.targetingQueue.add(JOBS.TARGET_BENEFICIARY, data, QUEUE_RETRY_OPTIONS);

    return target;
  }

  async saveTargetResult(data: CreateTargetResultDto) {
    const { filterOptions, targetUuid } = data;

    const fields = fetchSchemaFields(DB_MODELS.TBL_BENEFICIARY);
    const primary_fields = fields.filter((f) => f.name !== 'extras');
    const getFilterData = filterOptions[0]?.data;
    const keys = Object.keys(getFilterData);
    const values = Object.values(getFilterData);

    // 1. Split primary and extra queries
    const { primary, extra } = createPrimaryAndExtraQuery(
      primary_fields,
      keys,
      values,
    );

    // 2. Fetch data using primary AND query
    const benefData = await this.benefService.searchTargets(primary);

    // 3. Filter data using extras AND query
    const filteredData = filterExtraFieldValues(benefData.rows, extra);

    // 4.Merge result i.e. final_result UNION filteredDta
    // final_result = createFinalResult(final_result, filteredData);

    // 5. Save final result in the TargetResult && Update Status to COMPLETED
    await this.createManySearchResult(filteredData, targetUuid);
    await this.updateTargetQuery(targetUuid, {
      status: TARGET_QUERY_STATUS.COMPLETED as TargetQueryStatusEnum,
    });
    // this.targetingQueue.add(JOBS.SOCKET_EMIT, data);

    this.eventEmitter.emit(EVENTS.EMIT_TARGET_RESULT, targetUuid);

    return {
      message: `${filteredData.length} Target result saved successfully`,
    };
  }

  async searchTargetBeneficiaries(query: any) {
    const { filterOptions } = query;
    let final_result = [];
    const fields = fetchSchemaFields(DB_MODELS.TBL_BENEFICIARY);
    const primary_fields = fields.filter((f) => f.name !== 'extras');
    for (let item of filterOptions) {
      const keys = Object.keys(item);
      const values = Object.values(item);
      // 1. Split primary and extra queries
      const { primary, extra } = createPrimaryAndExtraQuery(
        primary_fields,
        keys,
        values,
      );
      // 2. Fetch data using primary AND query
      const data = await this.benefService.searchTargets(primary);
      // 3. Filter data using extras AND query
      const filteredData = filterExtraFieldValues(data.rows, extra);
      // 4.Merge result i.e. final_result UNION filteredDta
      final_result = createFinalResult(final_result, filteredData);
    }
    return final_result;
  }

  async updateTargetQuery(uuid: string, dto: any) {
    return this.prismaService.targetQuery.update({
      where: { uuid: uuid },
      data: dto,
    });
  }

  async findTargetedBeneficiary(targetUUID: string) {
    return this.prismaService.targetResult.findMany({
      where: {
        targetUuid: targetUUID,
      },
      select: {
        benefUuid: true,
      },
    });
  }

  async updateTargetQueryLabel(uuid: string, dto: updateTargetQueryLabelDTO) {
    const targetCriteria = { data: dto.targetingCriteria } as any;
    const benef = await this.findTargetedBeneficiary(uuid);
    if (!benef.length) throw new Error('No beneficiaries found!');

    const group = await this.groupService.upsertByName({
      name: dto.label,
      origins: [GroupOrigins.TARGETING],
      createdBy: dto.createdBy,
      targetingCriteria: targetCriteria,
    });
    const groupedBenef = benef.map((b: any) => {
      return {
        beneficiaryUID: b.benefUuid,
        groupUID: group.uuid,
      };
    });

    const bgData = await this.prismaService.beneficiaryGroup.createMany({
      data: groupedBenef,
      skipDuplicates: true,
    });

    return bgData;
  }

  async findTargetQueryById(queryUID: string) {
    return this.prismaService.targetQuery.findUnique({
      where: { uuid: queryUID },
    });
  }

  findCompletedAndNoLabelTargetQuery() {
    return this.prismaService.targetQuery.findMany({
      where: {
        label: null,
        status: TARGET_QUERY_STATUS.COMPLETED as TargetQueryStatusEnum,
      },
    });
  }

  findOneByUUID(uuid: UUID) {
    return this.prismaService.targetQuery.findUnique({
      where: { uuid },
    });
  }

  findBenefByGroup(uuid: string) {
    return this.prismaService.beneficiaryGroup.findMany({
      where: { groupUID: uuid },
      include: { beneficiary: true },
    });
  }

  async verifyPublicKey(appUrl: string) {
    const settings = await this.prismaService.setting.findUnique({
      where: { name: SETTINGS_NAMES.APP_IDENTITY },
    });
    if (!settings) throw new Error('Please setup app identity first!');
    const settingsData: any = settings.value;
    const baseUrl = getBaseUrl(appUrl);
    const { ADDRESS, PRIVATE_KEY } = settingsData;
    const apiUrl = `${baseUrl}/v1/app/auth-apps/${ADDRESS}/identity`;
    const response: any = await checkPublicKey(apiUrl);
    if (!response || !response.data) throw new Error('Invalid app identity!');
    return { ...response.data, privateKey: PRIVATE_KEY };
  }

  // const apiUrl = `${baseURL}/v1/beneficiaries/import-tools`;
  // ==========TargetResult Schema Operations==========
  async exportTargetBeneficiaries(dto: ExportTargetBeneficiaryDto) {
    const verified = await this.verifyPublicKey(dto.appURL);
    const { groupUUID, appURL } = dto;
    const group = await this.groupService.findUnique(groupUUID);
    if (!group) throw new Error('Group not found');
    const rows = await this.findBenefByGroup(group.uuid);
    if (!rows.length) throw new Error('No beneficiaries found for this group');
    const beneficiaries = rows.map((r: any) => r.beneficiary);
    const signature = await generateSignature(
      verified.nonceMessage,
      verified.privateKey,
    );

    for (let i = 0; i < beneficiaries.length; i += EXPORT_BATCH_SIZE) {
      const batchBeneficiares = beneficiaries.slice(i, i + EXPORT_BATCH_SIZE);
      const payload = {
        appUrl: appURL,
        signature,
        address: verified.address,
        buffer: Buffer.from(
          JSON.stringify({
            groupName: group.name,
            beneficiaries: batchBeneficiares,
          }),
        ),
      };

      // calculate size of buffer
      const size = Buffer.byteLength(JSON.stringify(payload.buffer), 'utf8');
      console.log('Buffer size:', size / (1024 * 1024), 'MB');

      await exportBulkBeneficiary(payload);
    }
    return {
      success: true,
      message: `${beneficiaries.length} beneficiaries exported successfully!`,
    };
  }

  async createManySearchResult(result: any, target: string) {
    if (!result.length) return;
    for (let d of result) {
      const payload = {
        targetUuid: target,
        benefUuid: d.uuid,
      };
      await this.prismaService.targetResult.create({ data: payload });
    }
  }

  async findByTargetUUID(targetUuid: string, query?: ListTargetUIDDto) {
    // return paginate(this.prismaService.targetResult, {
    //   where: { targetUuid: targetUuid },
    //   include: { beneficiary: true },
    // });

    const include: Prisma.TargetResultInclude = {
      beneficiary: true,
    };

    const conditions = { targetUuid: targetUuid };

    const rData = await paginate(
      this.prismaService.targetResult,
      { where: { ...conditions }, include },

      {
        page: +query?.page,
        perPage: +query?.perPage,
      },
    );
    // console.log(rData);
    // setTimeout(async () => {
    // }, 2000);

    return rData;
  }

  async cleanTargetQueryAndResults() {
    let count = 0;
    const targetQueries = await this.findCompletedAndNoLabelTargetQuery();
    if (!targetQueries.length) return;
    for (let q of targetQueries) {
      const targetResults = await this.findTargetResultByQueryUID(q.uuid);
      count = await this.compareDateAndDelete(targetResults, q.uuid);
    }
    console.log(`${count} Target results deleted!`);
  }

  async compareDateAndDelete(targetResult: any, targetQueryUID: string) {
    let deletedCount = 0;
    if (!targetResult.length) return deletedCount;
    for (let r of targetResult) {
      const days = calculateNumberOfDays(new Date(), new Date(r.createdAt));
      if (days > APP.DAYS_TO_DELETE_BENEF_TARGET) {
        await this.deleteTargetResult(r.id);
        deletedCount++;
      }
    }
    await this.DeleteTargetQuery(targetQueryUID);
    return deletedCount;
  }

  async deleteTargetResult(id: number) {
    const found = await this.findTargetResultById(id);
    if (found)
      await this.prismaService.targetResult.delete({ where: { id: +id } });
  }

  async DeleteTargetQuery(queryUID: string) {
    const found = await this.findTargetQueryById(queryUID);
    const targetResult = await this.findTargetResultByQueryUID(queryUID);
    if (found && !targetResult.length)
      return this.prismaService.targetQuery.delete({
        where: { uuid: queryUID },
      });
  }

  findTargetResultByQueryUID(targetUID: string) {
    return this.prismaService.targetResult.findMany({
      where: { targetUuid: targetUID },
    });
  }

  findTargetResultById(id: number) {
    return this.prismaService.targetResult.findUnique({ where: { id } });
  }

  list(filters: ListTargetQueryDto) {
    const AND_CONDITIONS = [];
    let conditions = {};

    if (filters.label) {
      AND_CONDITIONS.push({
        label: { contains: filters.label, mode: 'insensitive' },
      });
    }

    conditions = { AND: AND_CONDITIONS };

    const select: Prisma.TargetQuerySelect = {
      uuid: true,
      label: true,
      status: true,
      createdAt: true,
      createdBy: true,
      user: {
        select: {
          name: true,
        },
      },
    };

    return paginate(
      this.prismaService.targetQuery,
      {
        where: { ...conditions, label: { not: null } },
        select,
      },
      {
        page: filters.page,
        perPage: filters.perPage,
      },
    );
  }

  async downloadPinnedBeneficiary(targetUuid: string) {
    const getLabelName = await this.prismaService.targetQuery.findUnique({
      where: { uuid: targetUuid },
      select: {
        label: true,
      },
    });

    const pinnedBeneficiary = await this.prismaService.targetResult.findMany({
      where: { targetUuid },
      include: { beneficiary: true },
    });

    const formattedData = pinnedBeneficiary.map((item) => {
      return { ...item.beneficiary, label: getLabelName.label };
    });

    const excelData = generateExcelData(formattedData);
    return excelData;
  }
}
