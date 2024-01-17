import { Injectable } from '@nestjs/common';
import { CreateBeneficiarySourceDto } from './dto/create-beneficiary-source.dto';
import { UpdateBeneficiarySourceDto } from './dto/update-beneficiary-source.dto';
import { PrismaService } from '@rahat/prisma';
import { paginate } from '../utils/paginate';

@Injectable()
export class SourceService {
  constructor(private prisma: PrismaService) {}
  create(dto: CreateBeneficiarySourceDto) {
    try {
      return this.prisma.source.create({ data: dto });
    } catch (err) {
      throw new Error(err);
    }
  }

  findAll(query: any) {
    const select = {
      field_mapping: true,
      uuid: true,
      id: true,
      name: true,
      created_at: true,
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

  update(uuid: string, dto: UpdateBeneficiarySourceDto) {
    try {
      return this.prisma.source.update({
        where: { uuid },
        data: dto,
      });
    } catch (err) {
      throw new Error(err);
    }
  }

  remove(uuid: string) {
    return this.prisma.source.delete({
      where: {
        uuid,
      },
    });
  }
}
