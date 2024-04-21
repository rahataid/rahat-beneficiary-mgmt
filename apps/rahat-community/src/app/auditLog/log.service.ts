import { Injectable } from '@nestjs/common';
import { PrismaService } from '@rumsan/prisma';

@Injectable()
export class LogService {
  constructor(private prisma: PrismaService) {}

  async addLog(logData: { userUUID: string; action: string; data?: any }) {
    return this.prisma.log.create({
      data: logData,
    });
  }
}
