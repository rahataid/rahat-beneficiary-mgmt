import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

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
  field_type: string;

  @ApiProperty({
    type: 'object',
    example: { data: 'any' },
  })
  @IsOptional()
  field_populate: any;
}
