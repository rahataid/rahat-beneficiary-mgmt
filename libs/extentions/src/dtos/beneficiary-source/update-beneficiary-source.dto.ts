import { PartialType } from '@nestjs/mapped-types';
import { CreateBeneficiarySourceDto } from './create-beneficiary-source.dto';

export class UpdateBeneficiarySourceDto extends PartialType(
  CreateBeneficiarySourceDto,
) {}
