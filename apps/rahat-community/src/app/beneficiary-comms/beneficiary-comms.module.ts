import { Module } from '@nestjs/common';
import { BeneficiaryCommsService } from './beneficiary-comms.service';
import { BeneficiaryCommsController } from './beneficiary-comms.controller';

@Module({
  controllers: [BeneficiaryCommsController],
  providers: [BeneficiaryCommsService],
})
export class BeneficiaryCommsModule {}
