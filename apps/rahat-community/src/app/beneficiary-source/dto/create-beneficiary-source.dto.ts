import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNotEmptyObject, IsString } from 'class-validator';

export class CreateBeneficiarySourceDto {
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
  feild_apping: any;
}
