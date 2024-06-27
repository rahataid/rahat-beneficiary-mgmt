import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';
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
    example: '4837585a-d0e8-43c3-9382-ad29495a60d2',
  })
  @IsUUID()
  groupUUID!: UUID;

  @ApiProperty({
    type: 'string',
    example: 'https://api.rumsan.com/',
  })
  @IsString()
  appURL!: string;
}
