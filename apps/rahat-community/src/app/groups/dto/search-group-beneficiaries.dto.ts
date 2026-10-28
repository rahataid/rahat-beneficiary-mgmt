import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export const FILTER_COLUMN_TYPES = [
  'text',
  'enum',
  'number',
  'date',
  'boolean',
] as const;
export type FilterColumnType = (typeof FILTER_COLUMN_TYPES)[number];

export const FILTER_OPERATORS = [
  'contains',
  'notContains',
  'equals',
  'notEquals',
  'startsWith',
  'endsWith',
  'isEmpty',
  'isNotEmpty',
  'in',
  'notIn',
  'gt',
  'gte',
  'lt',
  'lte',
  'between',
] as const;
export type FilterOperator = (typeof FILTER_OPERATORS)[number];

export class ColumnConditionDto {
  @ApiProperty({ enum: FILTER_OPERATORS, example: 'contains' })
  @IsIn(FILTER_OPERATORS)
  operator: FilterOperator;

  @ApiPropertyOptional({
    description:
      'Value for single-value operators. Dates as YYYY-MM-DD, numbers as plain numbers.',
    example: 'ram',
  })
  @IsOptional()
  @IsString()
  value?: string;

  @ApiPropertyOptional({
    description: 'Upper bound for the "between" operator (inclusive).',
  })
  @IsOptional()
  @IsString()
  valueTo?: string;

  @ApiPropertyOptional({
    type: [String],
    description:
      'Checked values for "in" / "notIn" (the Excel checkbox list). Use an empty string "" to mean (Blanks).',
    example: ['MALE', ''],
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5000)
  @IsString({ each: true })
  values?: string[];
}

export class ColumnFilterDto {
  @ApiProperty({
    description:
      'Beneficiary column. Primary columns (firstName, phone, gender, ...) are matched directly; any other name is looked up in the extras JSON.',
    example: 'firstName',
  })
  @IsString()
  @Length(1, 100)
  field: string;

  @ApiPropertyOptional({
    enum: FILTER_COLUMN_TYPES,
    default: 'text',
    description:
      'Data type of the column. Ignored for primary columns (the server knows their type); used for extras fields.',
  })
  @IsOptional()
  @IsIn(FILTER_COLUMN_TYPES)
  type?: FilterColumnType;

  @ApiProperty({ type: [ColumnConditionDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(2)
  @ValidateNested({ each: true })
  @Type(() => ColumnConditionDto)
  conditions: ColumnConditionDto[];

  @ApiPropertyOptional({
    enum: ['AND', 'OR'],
    default: 'AND',
    description: 'How the (max two) conditions of this column are combined.',
  })
  @IsOptional()
  @IsIn(['AND', 'OR'])
  join?: 'AND' | 'OR';
}

export class BeneficiarySortDto {
  @ApiProperty({ example: 'firstName' })
  @IsString()
  @Length(1, 100)
  field: string;

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'asc' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  dir?: 'asc' | 'desc';

  @ApiPropertyOptional({ enum: FILTER_COLUMN_TYPES, default: 'text' })
  @IsOptional()
  @IsIn(FILTER_COLUMN_TYPES)
  type?: FilterColumnType;
}

export class SearchGroupBeneficiariesDto {
  @ApiPropertyOptional({
    type: [ColumnFilterDto],
    description: 'Column filters, combined with AND (like Excel).',
    default: [],
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => ColumnFilterDto)
  filters?: ColumnFilterDto[] = [];

  @ApiPropertyOptional({ type: BeneficiarySortDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => BeneficiarySortDto)
  sort?: BeneficiarySortDto;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 50, minimum: 1, maximum: 1000 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000)
  perPage?: number = 50;
}

export class DistinctGroupBeneficiaryValuesDto {
  @ApiProperty({ example: 'gender' })
  @IsString()
  @Length(1, 100)
  field: string;

  @ApiPropertyOptional({ enum: FILTER_COLUMN_TYPES, default: 'text' })
  @IsOptional()
  @IsIn(FILTER_COLUMN_TYPES)
  type?: FilterColumnType;

  @ApiPropertyOptional({
    description: 'Search box inside the filter dropdown (case-insensitive).',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    type: [ColumnFilterDto],
    description:
      'Currently active filters. The filter on `field` itself is ignored, so the list shows what is available given the other columns.',
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => ColumnFilterDto)
  filters?: ColumnFilterDto[] = [];

  @ApiPropertyOptional({ default: 100, minimum: 1, maximum: 1000 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000)
  limit?: number = 100;
}
