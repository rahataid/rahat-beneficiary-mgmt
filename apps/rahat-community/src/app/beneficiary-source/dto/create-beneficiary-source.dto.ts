import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNotEmptyObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateBeneficiarySourceDto {
  @ApiProperty({
    example: 'Kobotool',
  })
  @IsString()
  @IsOptional()
  name: string;

  @ApiProperty({
    type: 'object',
    example: { data: 'any' },
  })
  @IsOptional()
  details: any;

  @ApiProperty({
    type: 'object',
    example: { data: '[{key,value}]' },
  })
  @IsOptional()
  @IsNotEmptyObject()
  field_mapping: any;
}
