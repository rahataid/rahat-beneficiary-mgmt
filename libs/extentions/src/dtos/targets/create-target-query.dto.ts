import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export enum TargetQueryStatusEnum {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
}

export class CreateTargetQueryDto {
  @ApiProperty({
    type: 'array',
    example: [
      { gender: 'MALE', has_ssa: 'yes' },
      { gender: 'FEMALE', has_ssa: 'no' },
    ],
  })
  @IsOptional()
  filterOptions: any;
}
