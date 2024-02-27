import { PartialType } from '@nestjs/mapped-types';
import { CreateBeneficiaryImportDto } from './create-beneficiary-import.dto';

export class UpdateBeneficiaryImportDto extends PartialType(CreateBeneficiaryImportDto) {}
