import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class DeleteBeneficiaryGroupDto {
  @ApiProperty({
    type: 'string',
    example: '0584a396-fc5a-48ff-be62-c4d98f410cc3',
    description: 'uuid of beneficiary',
    required: true,
  })
  @IsString()
  beneficiaryUID!: string;

  @ApiProperty({
    type: 'string',
    example: '0584a396-fc5a-48ff-be62-c4d98f410cd8',
    description: 'uuid of group',
    required: true,
  })
  @IsString()
  groupUID!: string;
}
