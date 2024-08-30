import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { UUID } from 'crypto';

export class CreateBeneficiaryGroupDto {
  @ApiProperty({
    type: [String],
    example: ['0584a396-fc5a-48ff-be62-c4d98f410cc3'],
    description: 'Array of beneficiary UIDs',
    required: true,
  })
  @IsString({ each: true }) // Ensure each element in the array is a string
  beneficiaryUID!: UUID[];

  @ApiProperty({
    type: 'string',
    example: '0584a396-fc5a-48ff-be62-c4d98f410cd8',
    description: 'uuid of group',
    required: true,
  })
  @IsString()
  groupUID!: UUID;
}

export class ListBeneficiaryGroupDto {
  @ApiProperty({ example: 1 })
  @IsString()
  @IsOptional()
  sort!: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  page!: number;

  @ApiProperty({ example: '10' })
  @IsNumber()
  perPage!: number;
}
