import { Module } from '@nestjs/common';
import { BeneficiarySourceService } from './beneficiary-source.service';
import { BeneficiarySourceController } from './beneficiary-source.controller';

@Module({
  controllers: [BeneficiarySourceController],
  providers: [BeneficiarySourceService],
})
export class BeneficiarySourceModule {}
