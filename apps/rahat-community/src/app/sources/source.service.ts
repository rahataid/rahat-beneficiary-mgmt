import { Injectable } from '@nestjs/common';

import { PrismaService } from '@rumsan/prisma';
import { paginate } from '../utils/paginate';
import { validateRequiredFields } from '../beneficiary-import/helpers';
import { getCustomUniqueId } from '../settings/setting.config';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { JOBS, QUEUE, QUEUE_RETRY_OPTIONS } from '../../constants';
import { ConfigService } from '@nestjs/config';
import { CreateSourceDto, UpdateSourceDto } from '@community-tool/extentions';

@Injectable()
export class SourceService {
  constructor(
    @InjectQueue(QUEUE.BENEFICIARY.IMPORT) private queueClient: Queue,
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  async getMappingsByImportId(importId: string) {
    const res: any = await this.prisma.source.findUnique({
      where: { importId },
    });
    if (!res) return null;
    console.log(res);

    return res?.fieldMapping || null;
  }

  async create(dto: CreateSourceDto) {
    const DEV_ENV = this.config.get('ENV_DEV');

    const customUID = getCustomUniqueId();
    const missing_fields = validateRequiredFields(
      customUID,
      dto.fieldMapping.data,
    );
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

    if (DEV_ENV === 'dev') return row;
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
