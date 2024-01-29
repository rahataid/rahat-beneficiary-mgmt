import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum FieldType {
  Checkbox = 'Checkbox',
  Dropdown = 'Dropdown',
  Number = 'Number',
  Password = 'Password',
  Radio = 'Radio',
  Text = 'Text',
  Textarea = 'Textarea',
}

export class CreateFieldDefinitionDto {
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
  field_type: FieldType;

  @ApiProperty({
    type: 'object',
    example: { data: 'any' },
  })
  @IsOptional()
  field_populate: any;
}
