import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum FieldTypeEnum {
  Checkbox = 'CHECKBOX',
  Dropdown = 'DROPDOWN',
  Number = 'NUMBER',
  Password = 'PASSWORD',
  Radio = 'RADIO',
  Text = 'TEXT',
  Textarea = 'TEXTAREA',
}

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
    example: 'Text',
    description:
      'Valid data types:  CHECKBOX/DROPDOWN/NUMBER/PASSWORD/RADIO/TEXT/TEXTAREA',
  })
  @IsString()
  @IsNotEmpty()
  fieldType!: FieldTypeEnum;

  @ApiProperty({
    type: 'object',
    example: { data: 'any' },
  })
  @IsOptional()
  fieldPopulate: any;
}
