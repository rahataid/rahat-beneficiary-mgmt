import { HttpException, Injectable } from '@nestjs/common';
import {
  CreateBeneficiarySourceDto,
  CreateSourceDto,
} from './dto/create-beneficiary-source.dto';
import {
  UpdateBeneficiarySourceDto,
  UpdateSourceDto,
} from './dto/update-beneficiary-source.dto';
import { PrismaService } from '@rahat/prisma';
import { paginate } from '../utils/paginate';
import { CreateBeneficiaryDto } from '../beneficiaries/dto/create-beneficiary.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class SourceService {
  constructor(private prisma: PrismaService) {}
  create(dto: CreateSourceDto) {
    console.log(dto);
    try {
      console.log('DTO=>', dto);
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

  update(uuid: string, dto: UpdateSourceDto) {
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

  async createBeneficiarySource(dto: CreateBeneficiarySourceDto) {
    const exist = await this.prisma.beneficiarySource.findFirst({
      where: {
        beneficiary_id: dto.beneficiary_id,
        source_id: dto.source_id,
      },
    });

    if (!exist) {
      await this.prisma.beneficiarySource.create({
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
  }

  async listAllBeneficiarySource(query: any) {
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

  async updateBeneficiarySource(id: string, dto: UpdateBeneficiarySourceDto) {
    return await this.prisma.beneficiarySource.update({
      where: {
        id: parseInt(id),
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

  async findOneBeneficiarySource(id: string) {
    return await this.prisma.beneficiarySource.findUnique({
      where: {
        id: parseInt(id),
      },
    });
  }

  async removeBeneficiarySource(id: string) {
    return await this.prisma.beneficiarySource.delete({
      where: {
        id: parseInt(id),
      },
    });
  }
}
