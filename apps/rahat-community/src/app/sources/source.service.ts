import { Injectable } from '@nestjs/common';
import { CreateSourceDto } from './dto/create-beneficiary-source.dto';
import { UpdateSourceDto } from './dto/update-beneficiary-source.dto';
import { PrismaService } from '@rahat/prisma';
import { paginate } from '../utils/paginate';
import { validateRequiredFields } from '../beneficiary-import/helpers';

@Injectable()
export class SourceService {
  constructor(private prisma: PrismaService) {}
  async create(dto: CreateSourceDto) {
    const missing_fields = validateRequiredFields(dto.fieldMapping.data);
    if (missing_fields.length) {
      throw new Error(
        `Required fields missing! [${missing_fields.toString()}]`,
      );
    }
    const h = await this.prisma.source.create({ data: dto });
    return h;
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
