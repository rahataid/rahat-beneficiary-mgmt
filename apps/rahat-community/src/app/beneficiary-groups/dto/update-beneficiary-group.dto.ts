import { PartialType } from '@nestjs/mapped-types';
import { CreateBeneficiaryGroupDto } from './create-beneficiary-group.dto';

export class UpdateBeneficiaryGroupDto extends PartialType(CreateBeneficiaryGroupDto) {}
