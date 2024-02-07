import { HttpException, Injectable } from '@nestjs/common';
import { CreateBeneficiarySourceDto } from './dto/create-beneficiary-source.dto';
import { UpdateBeneficiarySourceDto } from './dto/update-beneficiary-source.dto';
import { PrismaService } from '@rahat/prisma';
import { Prisma } from '@prisma/client';
import { paginate } from '../utils/paginate';

@Injectable()
export class BeneficiarySourceService {
  constructor(private prisma: PrismaService) {}
  async create(dto: CreateBeneficiarySourceDto) {
    const exist = await this.prisma.beneficiarySource.findFirst({
      where: {
        beneficiary_id: dto.beneficiary_id,
        source_id: dto.source_id,
      },
    });
    if (exist) throw new Error('Already Connected');
    return await this.prisma.beneficiarySource.create({
      data: {
        beneficiary: {
          connect: {
            id: dto.beneficiary_id,
          },
        },
        source: {
          connect: {
            id: dto.source_id,
          },
        },
      },
    });
  }

  async listAll(query: any) {
    const select: Prisma.BeneficiarySourceSelect = {
      beneficiary_id: true,
      source_id: true,
      created_at: true,
      updated_at: true,
    };
    return paginate(
      this.prisma.beneficiarySource,
      { select },
      {
        page: query?.page,
        perPage: query?.perPage,
      },
    );
    // return await this.prisma.beneficiarySource.findMany({});
  }

  async update(id: number, dto: UpdateBeneficiarySourceDto) {
    return await this.prisma.beneficiarySource.update({
      where: {
        id: id,
      },
      data: {
        beneficiary: {
          connect: {
            id: dto.beneficiary_id,
          },
        },
        source: {
          connect: {
            id: dto.source_id,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    return await this.prisma.beneficiarySource.findUnique({
      where: {
        id: parseInt(id),
      },
    });
  }

  async remove(id: string) {
    return await this.prisma.beneficiarySource.delete({
      where: {
        id: parseInt(id),
      },
    });
  }
}
