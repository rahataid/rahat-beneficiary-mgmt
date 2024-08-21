import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
// import { PaginationDto } from '@rumsan/extensions/dtos';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class ListBeneficiaryDto {
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

  @ApiPropertyOptional({ example: 'MALE' })
  @IsString()
  @IsOptional()
  gender?: string;

  @ApiPropertyOptional({ example: 'Philip' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'Philip' })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional({ example: 'Phil' })
  @IsString()
  @IsOptional()
  nickName?: string;

  @ApiPropertyOptional({ example: 'Phil' })
  @IsString()
  @IsOptional()
  govtIDNumber?: string;

  @ApiPropertyOptional({ example: 'Phil' })
  @IsString()
  @IsOptional()
  phone?: string;
}
