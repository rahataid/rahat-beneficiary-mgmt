import { Injectable } from '@nestjs/common';
import {
  CreateTargetDto,
  TargetQueryStatusEnum,
} from './dto/create-target.dto';
import { BeneficiariesService } from '../beneficiaries/beneficiaries.service';
import { filterExtraFieldValues } from '../beneficiaries/helpers';
import { PrismaService } from '@rahat/prisma';
import { TARGET_QUERY_STATUS } from '../../constants';
import { paginate } from '../utils/paginate';
import { updateTargetQueryLabelDTO } from './dto/update-target.dto';

@Injectable()
export class TargetService {
  constructor(
    private prismaService: PrismaService,
    private benefService: BeneficiariesService,
  ) {}
  async create(dto: CreateTargetDto) {
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
