import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class FilterBeneficiaryByLocationDto {
  @ApiPropertyOptional({ example: 'Kathmandu' })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional({ example: '10' })
  @IsString()
  @IsOptional()
  ward_no?: string;
}
