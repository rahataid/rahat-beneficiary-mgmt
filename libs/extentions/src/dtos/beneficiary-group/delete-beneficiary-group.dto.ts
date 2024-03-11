import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class DeleteBeneficiaryGroupDto {
  @ApiProperty({
    type: 'number',
    example: '1',
    description: 'id of beneficiary',
    required: true,
  })
  @IsNumber()
  beneficiaryId!: number;

  @ApiProperty({
    type: 'number',
    example: '1',
    description: 'id of group',
    required: true,
  })
  @IsNumber()
  groupId!: number;
}
