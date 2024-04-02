import { Injectable } from '@nestjs/common';

import { CreateSourceDto, UpdateSourceDto } from '@community-tool/extentions';
import { InjectQueue } from '@nestjs/bull';
import { PrismaService } from '@rumsan/prisma';
import { Queue } from 'bull';
import {
  IMPORT_ACTION,
  JOBS,
  QUEUE,
  QUEUE_RETRY_OPTIONS,
} from '../../constants';
import { validateKeysAndValues } from '../beneficiary-import/helpers';
import { paginate } from '../utils/paginate';

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

  async ValidateBeneficiaryImort(customUniqueField: string, data: any) {
    const invalidFields = await validateKeysAndValues(customUniqueField, data);
    console.log('INvalid FIelds=>', invalidFields);
    return { invalidFields, result: data };
  }

  async create(dto: CreateSourceDto) {
    const { action, ...rest } = dto;
    const { data } = dto.fieldMapping;

    const customUniqueField = rest.uniqueField || '';

    if (action === IMPORT_ACTION.VALIDATE)
      return this.ValidateBeneficiaryImort(customUniqueField, data);

    if (action === IMPORT_ACTION.IMPORT) {
      const invalidFields = await validateKeysAndValues(
        customUniqueField,
        data,
      );

      if (invalidFields.length) throw new Error('Invalid data submitted!');
      const row = await this.prisma.source.upsert({
        where: { importId: rest.importId },
        update: { ...rest, isImported: false },
        create: rest,
      });
      this.queueClient.add(
        JOBS.BENEFICIARY.IMPORT,
        { sourceUUID: row.uuid },
        QUEUE_RETRY_OPTIONS,
      );
      return { message: 'Source created and added to queue' };
    }
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
