import { Injectable } from '@nestjs/common';
import { CreateSourceDto } from './dto/create-beneficiary-source.dto';
import { UpdateSourceDto } from './dto/update-beneficiary-source.dto';
import { PrismaService } from '@rahat/prisma';
import { paginate } from '../utils/paginate';
import { validateRequiredFields } from '../beneficiary-import/helpers';
import { getCustomUniqueId } from '../settings/setting.config';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { JOBS, QUEUE } from '../../constants';

@Injectable()
export class SourceService {
  constructor(
    @InjectQueue(QUEUE.BENEFICIARY.IMPORT) private queueClient: Queue,
    private prisma: PrismaService,
  ) {}

  async create(dto: CreateSourceDto) {
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
    // Upsert source by importID
    const row = await this.prisma.source.upsert({
      where: { importId: dto.importId },
      update: { ...dto, isImported: false },
      create: dto,
    });
    console.log('Upserted=>', row);
    // Add souceUUID to Queue
    this.queueClient.add(JOBS.BENEFICIARY.IMPORT, { sourceUUID: row.uuid });
    // Get source details from queue using sourceUUID
    // Import beneficiaries
    // Update status to imported
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
