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
import { createFinalResult, createPrimaryAndExtraQuery } from './helpers';
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
    const data = { target_uuid: target.uuid, filterOptions };
    this.targetingQueue.add(JOBS.TARGET_BENEFICIARY, data);
    return { message: 'Target query created and added to queue' };
  }

  async saveTargetResult(data: CreateTargetResultDto) {
    const { filterOptions, target_uuid } = data;
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
    await this.createManySearchResult(final_result, target_uuid);
    await this.updateTargetQuery(target_uuid, {
      status: TARGET_QUERY_STATUS.COMPLETED as TargetQueryStatusEnum,
    });
    return {
      message: `${final_result.length} Target result saved successfully`,
    };
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

  // ====OLD: Not in use! Remove it later===
  async createTarget(dto: any) {
    const { query, extras } = dto;
    // 1. Save the query and extras in the TargetQuery schema
    const target = await this.prismaService.targetQuery.create({ data: dto });
    // 2. Fetch results from the database using the main query
    const data = await this.benefService.searchTargets(query); // Queue
    if (!extras || Object.keys(extras).length < 1) {
      await this.createManySearchResult(data.rows, target.uuid); // Queue
    } else {
      // 3. Further filter the results if extras object has keys
      const filteredData = filterExtraFieldValues(data.rows, extras); // Queue
      // 4. Save filtered results in the TargetResult schema
      await this.createManySearchResult(filteredData, target.uuid); // Queue
    }
    // 5. Update the status of the target to COMPLETED
    const updated = await this.prismaService.targetQuery.update({
      where: { id: target.id },
      data: {
        status: TARGET_QUERY_STATUS.COMPLETED as TargetQueryStatusEnum,
      },
    });
    return updated;
  }

  // ==========TargetResult Schema Operations==========
  async createManySearchResult(result: any, target: string) {
    if (!result.length) return;
    for (let d of result) {
      const payload = {
        target_uuid: target,
        benef_uuid: d.uuid,
      };
      await this.prismaService.targetResult.create({ data: payload });
    }
  }

  findByTargetUUID(target_uuid: string) {
    return paginate(this.prismaService.targetResult, {
      where: { target_uuid: target_uuid },
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
      where: { target_uuid: targetUID },
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
}
