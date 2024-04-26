import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

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
}
