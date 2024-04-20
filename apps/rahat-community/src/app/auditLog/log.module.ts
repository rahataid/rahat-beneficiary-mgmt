import { Module } from '@nestjs/common';
import { LogService } from './log.service';
import { PrismaService } from '@rumsan/prisma';

@Module({
  providers: [LogService, PrismaService],
  exports: [LogService],
})
export class LogModule {}
