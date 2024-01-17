import { Module } from '@nestjs/common';
import { BeneficiarySourceService } from './beneficiary-source.service';
import { BeneficiarySourceController } from './beneficiary-source.controller';
import { PrismaService } from '@rahat/prisma';

@Module({
  controllers: [BeneficiarySourceController],
  providers: [BeneficiarySourceService, PrismaService],
})
export class BeneficiarySourceModule {}
