import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { UploadAssetParams } from 'rs-asset-uploader/dist/types';
import { CreateCommunityDto } from './create-community.dto';

export class UpdateCommunityDto extends PartialType(CreateCommunityDto) {
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
  latitude?: number;

  @ApiProperty({
    type: 'number',
    example: '100.72',
    description: 'Longitude of community',
    required: false,
  })
  @IsNumber()
  longitude?: number;

  @ApiProperty({
    type: 'number',
    example: 500,
    description: 'Budget of the community',
    required: true,
  })
  @IsNumber()
  fundRaisedUsd: number;

  @ApiProperty({
    type: 'string',
    example: '500',
    description: 'Fund raised by the community in local currency',
    required: true,
  })
  @IsString()
  fundRaisedLocal: string;

  @ApiProperty({
    type: 'string',
    example: 'NPR',
    description: 'Local Currency',
    required: true,
  })
  @IsString()
  localCurrency: string;

  @IsString()
  district?: string;

  @ApiProperty({
    example: {
      total_beneficiaries: 22,
    },
  })
  @IsOptional()
  beneficiaries?: any;
  @ApiProperty({
    example: {
      total_beneficiaries: 22,
    },
  })
  @IsOptional()
  summary?: any;
}

export class UpdateCommunityAssetDto {
  @ApiProperty({
    type: 'string',
    example: '',
  })
  logo?: string;

  @ApiProperty({
    type: 'string',
    example: '',
  })
  cover?: string;

  @ApiProperty({
    type: 'array',
    example: [],
  })
  gallery?: string[];
}

export class UploadAssetDto {
  @ApiProperty({
    type: 'string',
    example: '',
  })
  file: UploadAssetParams['file'];

  @ApiProperty({
    type: 'string',
    example: '',
  })
  fileName: UploadAssetParams['fileName'];

  @ApiProperty({
    type: 'array',
    example: [],
  })
  folderName: UploadAssetParams['folderName'];

  @ApiProperty({
    type: 'array',
    example: [],
  })
  mimeType: UploadAssetParams['mimeType'];
}
