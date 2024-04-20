import { Injectable } from '@nestjs/common';
import { PrismaService } from '@rumsan/prisma';

@Injectable()
export class LogService {
  constructor(private prisma: PrismaService) {}

  async addLog(userUUID: string, action: string, data?: any) {
    const logData: any = {
      userUUID,
      action,
      data,
    };
    return this.prisma.log.create({
      data: logData,
    });
  }
}
