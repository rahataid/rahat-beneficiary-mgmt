import { Inject, Injectable } from '@nestjs/common';
import {
  CreateBeneficiaryCommDto,
  ListBeneficiaryCommDto,
} from '@rahataid/community-tool-extensions';
import { PrismaService } from '@rumsan/prisma';
import { paginate } from '../utils/paginate';
import { CommsClient } from '../comms/comms.service';
import { TransportType, TriggerType } from '@rumsan/connect/src/types';

@Injectable()
export class BeneficiaryCommsService {
  constructor(
    private prisma: PrismaService,
    @Inject('COMMS_CLIENT')
    private commsClient: CommsClient,
  ) {}

  async listTransports() {
    const rows = await this.commsClient.transport.list();
    if (!rows?.data.length) return [];
    return rows.data.map((row) => {
      return {
        cuid: row.cuid,
        name: row.name,
        type: row.type,
      };
    });
  }

  async listBenefByGroup(groupUID: string) {
    const rows = await this.prisma.beneficiaryGroup.findMany({
      where: {
        groupUID,
      },
      include: {
        beneficiary: {
          select: {
            email: true,
            phone: true,
          },
        },
      },
    });
    if (!rows.length) throw new Error('No beneficiaries found in the group');
    return rows.map((row) => row.beneficiary);
  }

  pickPhoneOrEmail(beneficiaries: any[], type: string) {
    if (type === TransportType.SMTP) return beneficiaries.map((b) => b.email);
    else return beneficiaries.map((b) => b.phone);
  }

  // TODO: Implement this
  sanitizeMsgContent(msg: any, type: string) {
    if (type === TransportType.VOICE) return msg.mediaURL;
    else return msg;
  }

  async triggerCommunication(uuid: string) {
    const comm = await this.findOne(uuid);
    if (!comm) throw new Error('Communication not found');
    const { transportId, groupUID, message } = comm;
    const transport = await this.commsClient.transport.get(transportId);
    if (!transport) throw new Error('Transport not found');
    const beneficiaries = await this.listBenefByGroup(groupUID);
    const addresses = this.pickPhoneOrEmail(
      beneficiaries,
      transport.data?.type,
    );
    if (!addresses.length) throw new Error('No valid addresses found!');
    const msgContent = this.sanitizeMsgContent(message, transport.data?.type);
    return this.broadcastMessages({
      uuid,
      addresses,
      msgContent,
      transportId,
    });
  }

  async broadcastMessages({ uuid, addresses, msgContent, transportId }) {
    const sessionData = await this.commsClient.broadcast.create({
      addresses: addresses,
      maxAttempts: 3,
      message: {
        content: msgContent,
        meta: {
          subject: 'INFO',
        },
      },
      options: {},
      transport: transportId,
      trigger: TriggerType.IMMEDIATE,
    });
    const session = sessionData.data;
    return this.updateCommSession(uuid, session.cuid);
  }

  async updateCommSession(uuid: string, sessionId: string) {
    return this.prisma.beneficiaryComm.update({
      where: { uuid },
      data: {
        sessionId,
      },
    });
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
