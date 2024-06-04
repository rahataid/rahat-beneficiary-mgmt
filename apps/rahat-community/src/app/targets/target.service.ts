import { Injectable } from '@nestjs/common';

import { BeneficiariesService } from '../beneficiaries/beneficiaries.service';
import { filterExtraFieldValues } from '../beneficiaries/helpers';
import { PrismaService } from '@rumsan/prisma';
import {
  APP,
  DB_MODELS,
  JOBS,
  QUEUE,
  QUEUE_RETRY_OPTIONS,
  TARGET_QUERY_STATUS,
} from '../../constants';
import { paginate } from '../utils/paginate';
import { fetchSchemaFields } from '../beneficiary-import/helpers';
import {
  createFinalResult,
  createPrimaryAndExtraQuery,
  exportBulkBeneficiary,
} from './helpers';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { calculateNumberOfDays } from '../utils';
import {
  CreateTargetQueryDto,
  CreateTargetResultDto,
  ExportTargetBeneficiaryDto,
  ListTargetQueryDto,
  ListTargetUIDDto,
  TargetQueryStatusEnum,
  updateTargetQueryLabelDTO,
} from '@rahataid/community-tool-extensions';
import { Prisma } from '@prisma/client';
import { generateExcelData } from '../utils/export-to-excel';
import { UUID } from 'crypto';

@Injectable()
export class TargetService {
  constructor(
    @InjectQueue(QUEUE.TARGETING) private targetingQueue: Queue,
    private prismaService: PrismaService,
    private benefService: BeneficiariesService,
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

  updateTargetQueryLabel(uuid: string, dto: updateTargetQueryLabelDTO) {
    return this.prismaService.targetQuery.update({
      where: { uuid },
      data: dto,
    });
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
    console.log({ uuid });
    return this.prismaService.targetQuery.findUnique({
      where: { uuid },
    });
  }

  // ==========TargetResult Schema Operations==========
  async exportTargetBeneficiaries(dto: ExportTargetBeneficiaryDto) {
    const { targetUUID } = dto;
    const target = await this.findOneByUUID(targetUUID);
    if (!target || !target.label) throw new Error('Target not found');
    const rows = await this.prismaService.targetResult.findMany({
      where: { targetUuid: targetUUID },
      include: { beneficiary: true },
    });
    if (!rows.length) throw new Error('No beneficiaries found for this target');
    const beneficiaries = rows.map((r: any) => r.beneficiary);
    // Send to rahat server
    const baseURL = process.env.RAHAT_APP_URL;
    const payload = {
      groupName: target.label,
      targetUUID: targetUUID,
      beneficiaries,
    };
    const buffer = Buffer.from(JSON.stringify(payload));
    // Add to queue
    const apiUrl = `${baseURL}/v1/beneficiaries/import-tools`;
    await exportBulkBeneficiary(apiUrl, buffer);
    return {
      success: true,
      message: `Exported ${beneficiaries.length} beneficiaries`,
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

  findByTargetUUID(targetUuid: string, query?: ListTargetUIDDto) {
    // return paginate(this.prismaService.targetResult, {
    //   where: { targetUuid: targetUuid },
    //   include: { beneficiary: true },
    // });

    const include: Prisma.TargetResultInclude = {
      beneficiary: true,
    };

    console.log(query);
    const conditions = { targetUuid: targetUuid };

    return paginate(
      this.prismaService.targetResult,
      { where: { ...conditions }, include },

      {
        page: +query?.page,
        perPage: +query?.perPage,
      },
    );
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
    console.log(targetUuid);
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
