import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

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
    example: 'String',
    description: 'Valid prisma data type Eg: String/Int/DateTime/Boolean',
  })
  @IsString()
  @IsNotEmpty()
  field_type: string;
}
