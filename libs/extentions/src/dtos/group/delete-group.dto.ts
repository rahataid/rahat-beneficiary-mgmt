import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class PurgeGroupDto {
  @ApiProperty({
    type: 'string',
    description: 'group ID ',
  })
  @IsString()
  groupUuid!: string;

  @ApiProperty({
    type: [String],
    example: ['0584a396-fc5a-48ff-be62-c4d98f410cc3'],
    description: 'Array of beneficiary UIDs',
    required: true,
  })
  @IsString({ each: true }) // Ensure each element in the array is a string
  beneficiaryUuid!: string[];
}
