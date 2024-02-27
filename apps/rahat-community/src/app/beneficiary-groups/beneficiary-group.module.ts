import { Module } from '@nestjs/common';
import { BeneficiaryGroupService } from './beneficiary-group.service';
import { BeneficiaryGroupController } from './beneficiary-group.controller';
import { PrismaService } from '@rahat/prisma';

@Module({
  controllers: [BeneficiaryGroupController],
  providers: [BeneficiaryGroupService, PrismaService],
})
export class BeneficiaryGroupModule {}
