import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNotEmptyObject,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateSourceDto {
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
    example: {
      data: [
        {
          email: 'alice@mailinator.com',
          phone: '5551234567',
          gender: 'Female',
          lastName: 'Smith',
          birthDate: '1990-05-20T00:00:00.000Z',
          firstName: 'Alice',
        },
      ],
    },
  })
  @IsOptional()
  @IsNotEmptyObject()
  field_mapping: any;
}

export class CreateBeneficiarySourceDto {
  @ApiProperty({
    type: 'number',
    example: '1',
    description: 'id of beneficiary',
    required: true,
  })
  @IsNumber()
  beneficiary_id: number;

  @ApiProperty({
    type: 'number',
    example: '1',
    description: 'id of source',
    required: true,
  })
  @IsNumber()
  source_id: number;
}
