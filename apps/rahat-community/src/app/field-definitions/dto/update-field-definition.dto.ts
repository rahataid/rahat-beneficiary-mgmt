import { PartialType } from '@nestjs/mapped-types';
import { CreateFieldDefinitionDto } from './create-field-definition.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

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
    example: 'String',
    description: 'Valid prisma data type Eg: String/Int/DateTime/Boolean',
  })
  @IsString()
  @IsNotEmpty()
  field_type: string;
}

export class updateStatusDto {
  @ApiProperty({
    example: false,
  })
  @IsBoolean()
  @IsNotEmpty()
  is_active: boolean;
}
