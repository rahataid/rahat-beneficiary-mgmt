import { PartialType } from '@nestjs/mapped-types';
import {
  IsNotEmpty,
  IsNotEmptyObject,
  IsNumber,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import {
  CreateBeneficiarySourceDto,
  CreateSourceDto,
} from './create-beneficiary-source.dto';

export class UpdateSourceDto extends PartialType(CreateSourceDto) {
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
  fieldMapping: any;
}

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
