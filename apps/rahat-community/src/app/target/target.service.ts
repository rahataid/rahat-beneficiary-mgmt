import { Injectable } from '@nestjs/common';
import { CreateTargetDto } from './dto/create-target.dto';
import { UpdateTargetDto } from './dto/update-target.dto';
import { BeneficiariesService } from '../beneficiaries/beneficiaries.service';
import { filterExtraFieldValues } from '../beneficiaries/helpers';
import { PrismaService } from '@rahat/prisma';

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
    // 2. Fetch results from the database using the query
    const data = await this.benefService.searchTargets(query);
    if (!extras || Object.keys(extras).length < 1) {
      await this.createManySearchResult(data.rows, target.uuid);
    } else {
      // 3. Further filter the results if extras object has keys
      const filteredData = filterExtraFieldValues(data.rows, extras);
      // 4. Save filtered results in the TargetResult schema
      await this.createManySearchResult(filteredData, target.uuid);
    }
    // 5. Update the status of the target to COMPLETED
    await this.prismaService.targetQuery.update({
      where: { id: target.id },
      data: { status: 'COMPLETED' },
    });
    return target;
  }

  async createManySearchResult(result: any, target: any) {
    for (let d of result) {
      const payload = {
        target_uuid: String(target.uuid) as string,
        benef_uuid: d.uuid,
      };
      // await this.prismaService.targetResult.create({ data: payload });
    }
  }

  findAll() {
    return `This action returns all target`;
  }

  findOne(id: number) {
    return `This action returns a #${id} target`;
  }

  update(id: number, updateTargetDto: UpdateTargetDto) {
    return `This action updates a #${id} target`;
  }

  remove(id: number) {
    return `This action removes a #${id} target`;
  }
}
