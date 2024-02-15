import { Injectable } from '@nestjs/common';
import {
  CreateTargetQueryDto,
  CreateTargetResultDto,
  TargetQueryStatusEnum,
} from './dto/create-target.dto';
import { BeneficiariesService } from '../beneficiaries/beneficiaries.service';
import { filterExtraFieldValues } from '../beneficiaries/helpers';
import { PrismaService } from '@rahat/prisma';
import {
  APP,
  DB_MODELS,
  JOBS,
  QUEUE,
  TARGET_QUERY_STATUS,
} from '../../constants';
import { paginate } from '../utils/paginate';
import { updateTargetQueryLabelDTO } from './dto/update-target.dto';
import { fetchSchemaFields } from '../beneficiary-import/helpers';
import {
  createFinalResult,
  createPrimaryAndExtraQuery,
  exportBulkBeneficiary,
} from './helpers';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { calculateNumberOfDays } from '../utils';

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
    this.targetingQueue.add(JOBS.TARGET_BENEFICIARY, data);
    return { message: 'Target query created and added to queue' };
  }

  async saveTargetResult(data: CreateTargetResultDto) {
    const { filterOptions, targetUuid } = data;
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
    // 5. Save final result in the TargetResult && Update Status to COMPLETED
    await this.createManySearchResult(final_result, targetUuid);
    await this.updateTargetQuery(targetUuid, {
      status: TARGET_QUERY_STATUS.COMPLETED as TargetQueryStatusEnum,
    });
    return {
      message: `${final_result.length} Target result saved successfully`,
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

  updateTargetQueryLabel(id: number, dto: updateTargetQueryLabelDTO) {
    return this.prismaService.targetQuery.update({
      where: { id: +id },
      data: {
        label: dto.label,
      },
    });
  }

  async DeleteTargetQuery(queryUID: string) {
    const found = await this.findTargetQueryById(queryUID);
    const data = await this.findTargetResultByQueryUID(queryUID);
    if (found && !data.length)
      return this.prismaService.targetQuery.delete({ where: { id: found.id } });
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

  // ==========TargetResult Schema Operations==========
  async exportTargetBeneficiaries(targetUUID: string) {
    const { rows } = await this.findByTargetUUID(targetUUID);
    if (!rows.length) throw new Error('No beneficiaries found for this target');
    const beneficiaries = rows.map((r: any) => r.beneficiary);
    const buffer = Buffer.from(JSON.stringify(beneficiaries));
    // Send to rahat server
    const appUrl = process.env.RAHAT_APP_URL;
    await exportBulkBeneficiary(appUrl, buffer);
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

  findByTargetUUID(targetUuid: string) {
    return paginate(this.prismaService.targetResult, {
      where: { targetUuid: targetUuid },
      include: { beneficiary: true },
    });
  }

  async cleanTargetQueryAndResults() {
    let count = 0;
    const data = await this.findCompletedAndNoLabelTargetQuery();
    if (!data.length) return;
    for (let d of data) {
      const targetResults = await this.findTargetResultByQueryUID(d.uuid);
      count = await this.compareDateAndDelete(targetResults, d.uuid);
    }
    console.log(`${count} Target Results Deleted!`);
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

  findTargetResultByQueryUID(targetUID: string) {
    return this.prismaService.targetResult.findMany({
      where: { targetUuid: targetUID },
    });
  }

  async deleteTargetResult(id: number) {
    const found = await this.findTargetResultById(id);
    if (found)
      await this.prismaService.targetResult.delete({ where: { id: +id } });
  }

  findTargetResultById(id: number) {
    return this.prismaService.targetResult.findUnique({ where: { id } });
  }

  list() {
    return paginate(this.prismaService.targetResult, { where: {} });
  }
}
