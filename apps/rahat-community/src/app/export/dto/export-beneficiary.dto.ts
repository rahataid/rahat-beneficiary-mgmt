import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { UUID } from 'crypto';

export class ExportBeneficiaryDateRangeDto {
  @ApiProperty({
    type: 'uuid',
    example: '4837585a-d0e8-43c3-9382-ad29495a60d2',
  })
  @IsUUID()
  groupUUID!: UUID;

  @ApiPropertyOptional({
    type: 'string',
    example: '2025-01-01',
    description: 'Start date filter (beneficiary createdAt >= startDate)',
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({
    type: 'string',
    example: '2025-12-31',
    description: 'End date filter (beneficiary createdAt <= endDate)',
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;
}

export class ExportToAppDto {
  @ApiProperty({
    type: 'uuid',
    example: '4837585a-d0e8-43c3-9382-ad29495a60d2',
  })
  @IsUUID()
  groupUUID!: UUID;

  @ApiProperty({
    type: 'string',
    example: 'https://api.rumsan.com/',
    description: 'External app URL to receive the export callback',
  })
  @IsString()
  appURL!: string;
}
