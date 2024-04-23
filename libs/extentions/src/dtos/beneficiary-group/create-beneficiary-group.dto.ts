import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
import { UUID } from 'crypto';

export class CreateBeneficiaryGroupDto {
  @ApiProperty({
    type: [String],
    example: [1, 2, 3],
    description: 'Array of beneficiary UIDs',
    required: true,
  })
  @IsNumber({}, { each: true }) // Ensure each element in the array is a number
  beneficiaryUID!: UUID[];

  @ApiProperty({
    type: 'number',
    example: '1',
    description: 'id of group',
    required: true,
  })
  @IsNumber()
  groupUID!: UUID;
}
