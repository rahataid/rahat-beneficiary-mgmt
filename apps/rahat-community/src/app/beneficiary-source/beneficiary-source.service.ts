import { Injectable } from '@nestjs/common';
import { CreateBeneficiarySourceDto } from './dto/create-beneficiary-source.dto';
import { UpdateBeneficiarySourceDto } from './dto/update-beneficiary-source.dto';
import { PrismaService } from '@rahat/prisma';
import { paginate } from '../utils/paginate';

@Injectable()
export class BeneficiarySourceService {
  constructor(private prisma: PrismaService) {}
  create(dto: CreateBeneficiarySourceDto) {
    try {
      return this.prisma.beneficiarySource.create({ data: dto });
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
      this.prisma.beneficiarySource,
      { select },
      {
        page: query?.page,
        perPage: query?.perPage,
      },
    );
  }

  findOne(uuid: string) {
    return this.prisma.beneficiarySource.findUnique({ where: { uuid } });
  }

  update(uuid: string, dto: UpdateBeneficiarySourceDto) {
    try {
      return this.prisma.beneficiarySource.update({
        where: { uuid },
        data: dto,
      });
    } catch (err) {
      throw new Error(err);
    }
  }

  remove(uuid: string) {
    return this.prisma.beneficiarySource.delete({
      where: {
        uuid,
      },
    });
  }
}
