import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class CreateBeneficiaryGroupDto {
  @ApiProperty({
    type: [Number],
    example: [1, 2, 3],
    description: 'Array of beneficiary IDs',
    required: true,
  })
  @IsNumber({}, { each: true }) // Ensure each element in the array is a number
  beneficiariesId!: number[];

  @ApiProperty({
    type: 'number',
    example: '1',
    description: 'id of group',
    required: true,
  })
  @IsNumber()
  groupId!: number;
}
