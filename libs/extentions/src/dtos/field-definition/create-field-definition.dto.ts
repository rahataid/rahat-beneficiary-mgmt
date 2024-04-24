import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsBoolean } from 'class-validator';
import { Enums } from '@rahataid/community-tool-sdk';

export class CreateFieldDefinitionDto {
  @ApiProperty({
    type: 'string',
    example: 'citizenshipNumber',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    type: 'string',
    example: 'TEXT',
    description:
      'Valid data types:  CHECKBOX/DROPDOWN/NUMBER/PASSWORD/RADIO/TEXT/TEXTAREA',
  })
  @IsString()
  @IsNotEmpty()
  fieldType!: Enums.FieldTypeEnum;

  @ApiProperty({
    type: 'boolean',
    example: true,
  })
  @IsBoolean()
  isActive!: boolean;

  @ApiProperty({
    type: 'boolean',
    example: false,
  })
  @IsBoolean()
  isTargeting!: boolean;

  @ApiProperty({
    type: 'object',
    example: {
      data: [
        { label: 'yes', value: 'Yes' },
        { label: 'no', value: 'No' },
      ],
    },
  })
  @IsOptional()
  fieldPopulate: any;
}
