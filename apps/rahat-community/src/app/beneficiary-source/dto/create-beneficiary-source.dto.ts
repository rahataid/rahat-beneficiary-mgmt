import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class CreateBeneficiarySourceDto {
  @ApiProperty({
    type: 'number',
    example: '1',
    description: 'id of beneficiary',
    required: true,
  })
  @IsNumber()
  beneficiaryId: number;

  @ApiProperty({
    type: 'number',
    example: '1',
    description: 'id of source',
    required: true,
  })
  @IsNumber()
  sourceId: number;
}
