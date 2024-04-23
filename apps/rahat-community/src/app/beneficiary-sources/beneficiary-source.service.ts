import { Injectable } from '@nestjs/common';
import { PrismaService } from '@rumsan/prisma';
import { Prisma } from '@prisma/client';
import { paginate } from '../utils/paginate';
import {
  CreateBeneficiarySourceDto,
  UpdateBeneficiarySourceDto,
} from '@rahataid/community-tool-extensions';

@Injectable()
export class BeneficiarySourceService {
  constructor(private prisma: PrismaService) {}

  // Fix with UUID
  async create(dto: CreateBeneficiarySourceDto) {
    const exist = await this.prisma.beneficiarySource.findFirst({
      where: {
        beneficiaryUID: '',
        sourceUID: '',
      },
    });
    if (exist) return;
    return await this.prisma.beneficiarySource.create({
      data: {
        beneficiary: {
          connect: {
            id: dto.beneficiaryId,
          },
        },
        source: {
          connect: {
            id: dto.sourceId,
          },
        },
      },
    });
  }

  async listAll(query: any) {
    const select: Prisma.BeneficiarySourceSelect = {
      beneficiaryUID: true,
      sourceUID: true,
      createdAt: true,
      updatedAt: true,
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
            id: dto.beneficiaryId,
          },
        },
        source: {
          connect: {
            id: dto.sourceId,
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
