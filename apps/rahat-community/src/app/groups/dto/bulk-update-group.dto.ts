import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { BENEF_UNIQUE_FIELDS } from '../../beneficiary-import/helpers';

export class BulkUpdateGroupDto {
  @ApiPropertyOptional({ default: 500, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  batchSize?: number = 500;

  @ApiPropertyOptional({ enum: Object.values(BENEF_UNIQUE_FIELDS) })
  @IsOptional()
  @IsEnum(Object.values(BENEF_UNIQUE_FIELDS))
  uniqueField?: string;
}
