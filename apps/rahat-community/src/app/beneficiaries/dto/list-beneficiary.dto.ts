import { applyDecorators } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiQuery,
  getSchemaPath,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

// eslint-disable-next-line @typescript-eslint/ban-types,@typescript-eslint/explicit-module-boundary-types
export function ApiFilterQuery(fieldName: string, filterDto: Function) {
  return applyDecorators(
    ApiExtraModels(filterDto),
    ApiQuery({
      required: false,
      name: fieldName,
      style: 'deepObject',
      explode: true,
      type: 'object',
      schema: {
        $ref: getSchemaPath(filterDto),
      },
    }),
  );
}

export class BeneficiaryFilterDto {
  @ApiPropertyOptional({ example: '980000' })
  @IsString()
  @IsOptional()
  readonly work?: string;

  @ApiPropertyOptional({ example: '981010' })
  @IsString()
  @IsOptional()
  readonly home?: string;

  @ApiPropertyOptional({ example: 'John' })
  @IsString()
  @IsOptional()
  readonly firstName?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsString()
  @IsOptional()
  readonly page?: number;
}
