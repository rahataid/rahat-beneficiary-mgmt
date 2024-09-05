import { Inject, Injectable } from '@nestjs/common';
import {
  CreateBeneficiaryCommDto,
  ListBeneficiaryCommDto,
} from '@rahataid/community-tool-extensions';
import { PrismaService } from '@rumsan/prisma';
import { paginate } from '../utils/paginate';
import { CommsClient } from '../comms/comms.service';
import { TriggerType } from '@rumsan/connect/src/types';

@Injectable()
export class BeneficiaryCommsService {
  constructor(
    private prisma: PrismaService,
    @Inject('COMMS_CLIENT')
    private commsClient: CommsClient,
  ) {}

  async triggerCommunication(uuid: string) {
    // Get communication details
    // Create transport payload
    // Initiate send message
    // console.log('Client=>', this.commsClient);
    console.log({ uuid });

    const sessionData = await this.commsClient.broadcast.create({
      addresses: [],
      maxAttempts: 3,
      message: {
        content: 'Helllo',
        meta: {
          subject: 'INFO',
        },
      },
      options: {},
      transport: '',
      trigger: TriggerType.IMMEDIATE,
    });
    // Update comms info
    return sessionData.data;
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
