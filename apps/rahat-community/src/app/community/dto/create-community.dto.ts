import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCommunityDto {
  @ApiProperty({
    type: 'string',
    example: 'Tayaba',
    description: 'Name Of Community',
  })
  @IsString()
  name: string;

  @ApiProperty({
    type: 'string',
    example: 'Tayaba',
    description: 'Address Of Community',
  })
  @IsString()
  address: string;

  @ApiProperty({
    type: 'number',
    example: 1,
    description: 'Community Category',
    required: true,
  })
  @IsNumber()
  categoryId: number;

  @ApiProperty({
    type: 'string',
    example: 'h20 Relief distribution',
    description: 'H20 relief distribution',
    required: true,
  })
  @IsString()
  description: string;

  @ApiProperty({
    type: 'number',
    example: '10.11',
    description: 'Latitude of community',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @ApiProperty({
    type: 'number',
    example: '100.72',
    description: 'Longitude of community',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  longitude?: number;

  @ApiProperty({
    type: 'string',
    example: 'Nepal',
    description: 'community Country',
    required: true,
  })
  @IsString()
  country: string;

  @ApiProperty({
    type: 'string',
    example: 'Rupandehi',
    description: 'Community District',
    required: false,
  })
  @IsString()
  @IsOptional()
  district?: string;

  @ApiProperty({
    type: 'number',
    example: 500,
    description: 'Budget of the community',
    required: true,
  })
  @IsNumber()
  @IsOptional()
  fundRaisedUsd?: number;

  @ApiProperty({
    type: 'string',
    example: '500',
    description: 'Fund raised by the community in local currency',
    required: true,
  })
  @IsString()
  @IsOptional()
  fundRaisedLocal?: string;

  @ApiProperty({
    type: 'string',
    example: 'NPR',
    description: 'Local Currency',
    required: true,
  })
  @IsString()
  localCurrency: string;

  @ApiProperty({
    type: 'array',
    items: { type: 'string' },
    example: ['mg1', 'mg2', 'mg3'],
    description: 'Budget of the community',
    required: false,
  })
  @IsArray()
  @IsOptional()
  managers: string[];

  @ApiProperty({
    type: 'json',
    example: {
      cover: 'Qmdgfw7c44YMbhHghNcFR5wF78J8BxniSKhr4qCPznQKzG',
      logo: 'QmYpufyj4YRzHg9FPUoGAyvbgXtYaeUXHVSvDPsouBSk9H',
      gallery: [
        'QmYpufyj4YRzHg9FPUoGAyvbgXtYaeUXHVSvDPsouBSk9H',
        'QmYpufyj4YRzHg9FPUoGAyvbgXtYaeUXHVSvDPsouBSk9H',
      ],
    },
  })
  @IsOptional()
  images?: Record<string, string>;

  @ApiProperty({
    type: 'array',
    items: { type: 'string' },
    example: ['tag2', 'tag1'],
    description: 'Tags IDs of the community',
    required: false,
  })
  @IsArray()
  @IsOptional()
  tags?: string[];

  @ApiProperty({
    example: {
      extras: {},
      total_beneficiaries: 22,
      gender_male: 5,
      gender_female: 49,
      gender_other: 7,
      bank_yes: 100,
      bank_no: 50,
      internet_yes: 20,
      internet_no: 25,
    },
  })
  @IsOptional()
  summary?: any;
}
