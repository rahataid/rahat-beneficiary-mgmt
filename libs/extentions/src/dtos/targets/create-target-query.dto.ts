import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import { UUID } from 'crypto';

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

  @ApiProperty({
    type: 'string',
    example: 'a1b2c3d4-1234-5678-1234-567812345678',
  })
  @IsOptional()
  createdBy?: string;
}

export class ExportTargetBeneficiaryDto {
  @ApiProperty({
    type: 'uuid',
    example: 'a1b2c3d4-1234-5678-1234-567812345678',
  })
  @IsUUID()
  targetUUID!: UUID;
}
