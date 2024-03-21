import { Injectable } from '@nestjs/common';

import { PrismaService } from '@rumsan/prisma';
import { paginate } from '../utils/paginate';
import { validateRequiredFields } from '../beneficiary-import/helpers';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { JOBS, QUEUE, QUEUE_RETRY_OPTIONS } from '../../constants';
import { CreateSourceDto, UpdateSourceDto } from '@community-tool/extentions';

@Injectable()
export class SourceService {
  constructor(
    @InjectQueue(QUEUE.BENEFICIARY.IMPORT) private queueClient: Queue,
    private prisma: PrismaService,
  ) {}

  async getMappingsByImportId(importId: string) {
    const res: any = await this.prisma.source.findUnique({
      where: { importId },
    });
    if (!res) return null;
    return res;
  }

  async create(dto: CreateSourceDto) {
    const customUniqueField = dto.uniqueField || '';
    const missing_fields = validateRequiredFields(
      customUniqueField,
      dto.fieldMapping.data,
    );
    console.log('Missing_Fields=>', missing_fields);
    return;
    if (missing_fields.length) {
      throw new Error(
        `Required fields missing! [${missing_fields.toString()}]`,
      );
    }
    const row = await this.prisma.source.upsert({
      where: { importId: dto.importId },
      update: { ...dto, isImported: false },
      create: dto,
    });
    this.queueClient.add(
      JOBS.BENEFICIARY.IMPORT,
      { sourceUUID: row.uuid },
      QUEUE_RETRY_OPTIONS,
    );
    return { message: 'Source created and added to queue' };
  }

  findAll(query: any) {
    const select = {
      fieldMapping: true,
      uuid: true,
      id: true,
      name: true,
      createdAt: true,
    };

    return paginate(
      this.prisma.source,
      { select },
      {
        page: query?.page,
        perPage: query?.perPage,
      },
    );
  }

  findOne(uuid: string) {
    return this.prisma.source.findUnique({ where: { uuid } });
  }

  update(uuid: string, dto: UpdateSourceDto) {
    return this.prisma.source.update({
      where: { uuid },
      data: dto,
    });
  }

  updateImportFlag(uuid: string, flag: boolean) {
    return this.prisma.source.update({
      where: { uuid },
      data: { isImported: flag },
    });
  }

  remove(uuid: string) {
    return this.prisma.source.delete({
      where: {
        uuid,
      },
    });
  }
}
