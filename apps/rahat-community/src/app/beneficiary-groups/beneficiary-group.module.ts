import { Module } from '@nestjs/common';
import { BeneficiaryGroupService } from './beneficiary-group.service';
import { BeneficiaryGroupController } from './beneficiary-group.controller';
import { PrismaService } from '@rumsan/prisma';
import { BullModule } from '@nestjs/bull';
import { QUEUE } from '../../constants';

@Module({
  imports: [BullModule.registerQueue({ name: QUEUE.BENEFICIARY })],
  controllers: [BeneficiaryGroupController],
  providers: [BeneficiaryGroupService, PrismaService],
  exports: [BeneficiaryGroupService],
})
export class BeneficiaryGroupModule {}
