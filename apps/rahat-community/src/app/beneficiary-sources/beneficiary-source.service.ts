import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@rumsan/prisma';
import { Prisma } from '@prisma/client';
import { paginate } from '../utils/paginate';
import {
  CreateBeneficiarySourceDto,
  UpdateBeneficiarySourceDto,
} from '@rahataid/community-tool-extensions';

@Injectable()
export class BeneficiarySourceService {
  private readonly logger = new Logger(BeneficiarySourceService.name);

  constructor(private prisma: PrismaService) {}

  // Fix with UUID
  async create(dto: CreateBeneficiarySourceDto) {
    this.logger.log(
      `Create beneficiary-source link requested. beneficiaryId=${dto.beneficiaryId}, sourceId=${dto.sourceId}`,
    );

    const exist = await this.prisma.beneficiarySource.findFirst({
      where: {
        beneficiaryUID: '',
        sourceUID: '',
      },
    });
    if (exist) {
      this.logger.debug(
        'Beneficiary-source link already exists, skipping create.',
      );
      return;
    }

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
    this.logger.debug(
      `Listing beneficiary-source links. page=${query?.page ?? 1}, perPage=${
        query?.perPage ?? 'default'
      }`,
    );

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
    this.logger.log(
      `Updating beneficiary-source link. id=${id}, beneficiaryId=${dto.beneficiaryId}, sourceId=${dto.sourceId}`,
    );

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
    this.logger.debug(`Fetching beneficiary-source link by id=${id}`);
    return await this.prisma.beneficiarySource.findUnique({
      where: {
        id: parseInt(id),
      },
    });
  }

  async removeBeneficiaryFromSource(beneficiaryUID: string) {
    this.logger.log(
      `Removing all source links for beneficiaryUID=${beneficiaryUID}`,
    );

    return this.prisma.beneficiarySource.deleteMany({
      where: {
        beneficiaryUID,
      },
    });
  }

  async remove(id: string) {
    this.logger.log(`Removing beneficiary-source link by id=${id}`);
    return await this.prisma.beneficiarySource.delete({
      where: {
        id: parseInt(id),
      },
    });
  }
}
