import { PartialType } from '@nestjs/mapped-types';
import { CreateFieldDefinitionDto } from './create-field-definition.dto';
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
      'Valid prisma data type Eg:  Checkbox/Dropdown/Number/Password/Radio/Text/Textarea',
  })
  @IsString()
  @IsNotEmpty()
  field_type: string;

  @ApiProperty({
    type: 'object',
    example: { data: 'any' },
  })
  @IsOptional()
  field_populate: any;
}

export class updateStatusDto {
  @ApiProperty({
    example: false,
  })
  @IsBoolean()
  @IsNotEmpty()
  is_active: boolean;
}
