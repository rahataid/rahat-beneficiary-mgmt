import { PartialType } from '@nestjs/mapped-types';
import { CreateBeneficiarySourceDto } from './create-beneficiary-source.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class UpdateBeneficiarySourceDto extends PartialType(
  CreateBeneficiarySourceDto,
) {
  @ApiProperty({
    type: 'number',
    example: '1',
    description: 'id of beneficiary',
    required: true,
  })
  @IsNumber()
  beneficiaryId: number;

  @ApiProperty({
    type: 'number',
    example: '1',
    description: 'id of source',
    required: true,
  })
  @IsNumber()
  sourceId: number;
}
