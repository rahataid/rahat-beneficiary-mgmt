import { Module } from '@nestjs/common';
import { BeneficiaryGroupService } from './beneficiary-group.service';
import { BeneficiaryGroupController } from './beneficiary-group.controller';

@Module({
  controllers: [BeneficiaryGroupController],
  providers: [BeneficiaryGroupService],
})
export class BeneficiaryGroupModule {}
