import { Injectable } from '@nestjs/common';
import {
  CreateBeneficiaryCommDto,
  ListBeneficiaryCommDto,
} from '@rahataid/community-tool-extensions';
import { PrismaService } from '@rumsan/prisma';
import { paginate } from '../utils/paginate';

@Injectable()
export class BeneficiaryCommsService {
  constructor(private prisma: PrismaService) {}

  async triggerMsgSend(uuid: string) {
    // Get communication details
    // Create transport payload
    // Initiate send message
    return uuid;
  }

  create(dto: CreateBeneficiaryCommDto) {
    return this.prisma.beneficiaryComm.create({
      data: dto,
    });
  }

  findAll(query: ListBeneficiaryCommDto) {
    const conditions = {};
    if (query.name) {
      conditions['name'] = { contains: query.name, mode: 'insensitive' };
    }
    return paginate(
      this.prisma.beneficiaryComm,
      {
        where: conditions,
        orderBy: { createdAt: query.order },
      },
      {
        page: query.page,
        perPage: query.perPage,
      },
    );
  }

  findOne(uuid: string) {
    return this.prisma.beneficiaryComm.findUnique({
      where: { uuid },
    });
  }
}
