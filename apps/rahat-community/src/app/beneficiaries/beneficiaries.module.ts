import { Module } from '@nestjs/common';
import { BeneficiariesService } from './beneficiaries.service';
import { BeneficiariesController } from './beneficiaries.controller';
import { PrismaService } from '@rahat/prisma';
import { FieldDefinitionsService } from '../field-definitions/field-definitions.service';

@Module({
  controllers: [BeneficiariesController],
  providers: [BeneficiariesService, PrismaService, FieldDefinitionsService],
})
export class BeneficiariesModule {}
