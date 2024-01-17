import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsNotEmptyObject, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { CreateBeneficiarySourceDto } from './create-beneficiary-source.dto';

export class UpdateBeneficiarySourceDto extends PartialType(
  CreateBeneficiarySourceDto,
) {
  @ApiProperty({
    example: 'Kobotool',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    type: 'object',
    example: { data: 'any' },
  })
  details: any;

  @ApiProperty({
    type: 'object',
    example: { data: '[{key,value}]' },
  })
  @IsNotEmptyObject()
  field_mapping: any;
}
