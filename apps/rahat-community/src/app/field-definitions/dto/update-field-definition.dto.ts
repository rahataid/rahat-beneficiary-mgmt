import { PartialType } from '@nestjs/mapped-types';
import {
  CreateFieldDefinitionDto,
  FieldTypeEnum,
} from './create-field-definition.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateFieldDefinitionDto extends PartialType(
  CreateFieldDefinitionDto,
) {
  @ApiProperty({
    type: 'string',
    example: 'citizenship_number',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    type: 'string',
    example: 'Text',
    description:
      'Valid data types:  CHECKBOX/DROPDOWN/NUMBER/PASSWORD/RADIO/TEXT/TEXTAREA',
  })
  @IsString()
  @IsNotEmpty()
  fieldType: FieldTypeEnum;

  @ApiProperty({
    type: 'object',
    example: { data: 'any' },
  })
  @IsOptional()
  fieldPopulate: any;
}

export class updateStatusDto {
  @ApiProperty({
    example: false,
  })
  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean;
}
