import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateBeneficiaryCommDto {
  constructor() {
    this.name = '';
    this.groupUID = '';
    this.message = '';
    this.transportId = '';
  }

  @IsNotEmpty()
  @ApiProperty({
    type: 'string',
    example: 'Demo',
  })
  @IsString()
  name: string;

  @IsNotEmpty()
  @ApiProperty({
    type: 'string',
    example: '1abc97f9-3ed2-4464-ac6c-0c9816e94992',
  })
  @IsString()
  groupUID: string;

  @IsNotEmpty()
  @ApiProperty({
    type: 'string',
    example: 'Hello world',
  })
  @IsString()
  message: string;

  @IsNotEmpty()
  @ApiProperty({
    type: 'string',
    example: '1234',
  })
  @IsString()
  transportId: string;

  @ApiProperty({
    type: 'string',
    example: '1234',
  })
  @IsString()
  @IsOptional()
  sessionId?: string;

  @ApiProperty({
    type: 'string',
  })
  @IsString()
  @IsOptional()
  createdBy?: string;
}

export class ListBeneficiaryCommDto {
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

  @ApiPropertyOptional({ example: 'Demo' })
  @IsString()
  @IsOptional()
  name?: string;
}

export class ListSessionLogsDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  page!: number;

  @ApiProperty({ example: '10' })
  @IsNumber()
  limit!: number;
}
