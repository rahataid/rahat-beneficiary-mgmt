import { Module } from '@nestjs/common';
import { BeneficiariesService } from './beneficiaries.service';
import { BeneficiariesController } from './beneficiaries.controller';
import { PrismaService } from '@rahat/prisma';

@Module({
  controllers: [BeneficiariesController],
  providers: [BeneficiariesService, PrismaService],
})
export class BeneficiariesModule {}
