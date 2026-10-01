import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class ListGroupDto {
  @ApiProperty({ example: 1 })
  @IsString()
  @IsOptional()
  sort!: string;

  @ApiProperty({ example: 'desc' })
  @IsString()
  @IsOptional()
  order!: 'asc' | 'desc';

  @ApiProperty({ example: 1 })
  @IsNumber()
  page!: number;

  @ApiProperty({ example: '10' })
  @IsNumber()
  perPage!: number;

  @ApiPropertyOptional({ example: 'Tayaba' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  @Transform(({ obj, key }) => {
    return obj[key] === 'true' ? true : obj[key] === 'false' ? false : obj[key];
  })
  autoCreated?: boolean;

  @ApiPropertyOptional({
    type: 'string',
    example: '{"firstName":"Hemanta","phone":"98"}',
    description:
      'JSON-encoded map of beneficiary field name to search value, used by GroupService.findOne to filter the beneficiaries within a group. Matches case-insensitively as a "contains" search. Any key that is not a primary beneficiary column is looked up inside the extras JSON field.',
  })
  @IsOptional()
  @IsObject()
  @Transform(({ obj, key }) => {
    const raw = obj[key];
    if (typeof raw !== 'string') return raw;
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  })
  filters?: Record<string, string>;
}
