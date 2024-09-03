import { ApiProperty } from '@nestjs/swagger';

import { Enums } from '@rahataid/community-tool-sdk';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import {
  IsValidLatitude,
  IsAlphaString,
  IsValidDate,
  IsValidLongitude,
} from '../../validators';

export class BulkInsertDto {
  @ApiProperty({
    type: 'array',
    example: [{ gender: 'MALE' }, { maxAge: 30 }],
  })
  @IsOptional()
  data: any;
}

export class CreateBeneficiaryDto {
  constructor() {
    this.firstName = '';
    this.lastName = '';
    this.govtIDNumber = '';
  }

  @IsNotEmpty()
  @ApiProperty({
    type: 'string',
    example: 'Ram',
  })
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @ApiProperty({
    type: 'string',
    example: 'Sharma',
  })
  @IsString()
  lastName: string;

  @ApiProperty({
    type: 'string',
    example: '1234-4545',
  })
  @IsString()
  govtIDNumber?: string;

  @ApiProperty({
    type: 'string',
    example: Enums.Gender.MALE,
    description: 'Gender ',
  })
  @IsString()
  @IsOptional()
  @IsEnum(Enums.Gender)
  gender?: Enums.Gender;

  @ApiProperty({
    type: 'string',
    example: '2004-03-08',
    description: 'YYYY-MM-DD format',
  })
  @IsOptional()
  @IsValidDate()
  birthDate?: string;

  @IsOptional()
  @ApiProperty({
    type: 'string',
    example: '0x9EED8BdfEfabC54B68Fe62da2e09b7B62E0dF846',
  })
  @IsAlphaString()
  @MinLength(40)
  walletAddress?: string;

  @ApiProperty({
    type: 'string',
    example: '9785623749',
  })
  @IsString()
  @IsOptional()
  @MinLength(10)
  phone?: string;

  @ApiProperty({
    type: 'string',
    example: 'ram@mailinator.com',
  })
  @IsString()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    type: 'string',
    example: 'lalitpur',
  })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({
    type: 'number',
    example: '26.24',
  })
  @IsNumber()
  @IsOptional()
  @IsValidLatitude()
  latitude?: number;

  @ApiProperty({
    type: 'number',
    example: '86.24',
  })
  @IsNumber()
  @IsOptional()
  @IsValidLongitude()
  longitude?: number;

  @ApiProperty({
    type: 'string',
    example: 'This is a note to remember',
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({
    type: 'string',
    example: Enums.InternetStatus.HOME_INTERNET,
    description: 'Type of internet use ',
  })
  @IsString()
  @IsOptional()
  @IsEnum(Enums.InternetStatus)
  internetStatus?: Enums.InternetStatus;

  @ApiProperty({
    type: 'string',
    example: Enums.BankedStatus.UNBANKED,
  })
  @IsString()
  @IsOptional()
  @IsEnum(Enums.BankedStatus)
  bankedStatus?: Enums.BankedStatus;

  @ApiProperty({
    type: 'string',
    example: Enums.PhoneStatus.SMART_PHONE,
  })
  @IsString()
  @IsOptional()
  @IsEnum(Enums.PhoneStatus)
  phoneStatus?: Enums.PhoneStatus;

  @ApiProperty({
    type: 'boolean',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  archived?: boolean;

  @ApiProperty({
    type: 'string',
    example: 'a1b2c3d4-1234-5678-1234-567812345678',
  })
  @IsOptional()
  createdBy?: string;

  @ApiProperty({
    format: 'json',
    description: 'Additional JSON data',
    required: false,
    example: {
      totalFamilyMembers: 5,
    },
  })
  @IsOptional()
  @IsObject()
  extras?: any;
}
