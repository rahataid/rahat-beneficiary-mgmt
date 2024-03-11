import { Module } from '@nestjs/common';
import { SourceService } from './source.service';
import { SourceController } from './source.controller';
import { PrismaService } from '@rumsan/prisma';
import { BullModule } from '@nestjs/bull';
import { QUEUE } from '../../constants';

@Module({
  imports: [BullModule.registerQueue({ name: QUEUE.BENEFICIARY.IMPORT })],
  controllers: [SourceController],
  providers: [SourceService, PrismaService],
})
export class SourceModule {}
