import { Injectable } from '@nestjs/common';
import {
  CreateTargetDto,
  TargetQueryStatusEnum,
} from './dto/create-target.dto';
import { BeneficiariesService } from '../beneficiaries/beneficiaries.service';
import { filterExtraFieldValues } from '../beneficiaries/helpers';
import { PrismaService } from '@rahat/prisma';
import { DB_MODELS, JOBS, QUEUE, TARGET_QUERY_STATUS } from '../../constants';
import { paginate } from '../utils/paginate';
import { updateTargetQueryLabelDTO } from './dto/update-target.dto';
import { fetchSchemaFields } from '../beneficiary-import/helpers';
import { createFinalResult, createPrimaryAndExtraQuery } from './helpers';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

// ==Sample query==
// {
//   "filter_options": [
//      {
//         "gender": "Male",
//         "has_citizenship": true
//       },
//       { "gender": "Female", "has_citizenship": true },
//       { "max_age": 37 }
//   ]
// }

@Injectable()
export class TargetService {
  constructor(
    @InjectQueue(QUEUE.TARGETING) private targetingQueue: Queue,
    private prismaService: PrismaService,
    private benefService: BeneficiariesService,
  ) {}

  // 1. Create target query with DTO
  // 2. Insert target query into QUEUE
  // 3. QUEUE will perform => Fetch results && Save into target result

  async create(dto: CreateTargetDto) {
    const { filter_options } = dto;
    const data = { id: 1, filter_options };
    this.targetingQueue.add(JOBS.CREATE_TARGET, data);
    return;
    let final_result = [];
    const fields = fetchSchemaFields(DB_MODELS.TBL_BENEFICIARY);
    const primary_fields = fields.filter((f) => f.name !== 'extras');
    for (let item of filter_options) {
      const keys = Object.keys(item);
      const values = Object.values(item);
      const { primary, extra } = createPrimaryAndExtraQuery(
        primary_fields,
        keys,
        values,
      );
      // Fetch data using primary AND query
      const data = await this.benefService.searchTargets(primary);
      // Filter data using extras AND query
      const filteredData = filterExtraFieldValues(data.rows, extra);
      // Merge result with final_result UNION filteredDta
      final_result = createFinalResult(final_result, filteredData);
    }
    console.log('Final Result: ', final_result.length);
    return final_result;
  }

  // ====OLD: Not in use!===
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

  updateTargetQueryLabel(id: number, dto: updateTargetQueryLabelDTO) {
    return this.prismaService.targetQuery.update({
      where: { id: +id },
      data: {
        label: dto.label,
      },
    });
  }

  findAll() {
    return `This action returns all target`;
  }

  findByTargetUUID(target_uuid: string) {
    return paginate(this.prismaService.targetResult, {
      where: { target_uuid: target_uuid },
      include: { beneficiary: true },
    });
  }
}
