import { ApiProperty } from '@nestjs/swagger';
import {
  BankedStatus,
  Gender,
  InternetStatus,
  PhoneStatus,
} from '@rahataid/community-tool-sdk/enums/';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { IsAlphaString, IsValidDate } from '../../validators';

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
  }
  @IsOptional()
  customId?: string;

  @IsNotEmpty()
  @ApiProperty({
    type: 'string',
    example: 'Ram',
  })
  @IsAlphaString()
  firstName: string;

  @IsNotEmpty()
  @ApiProperty({
    type: 'string',
    example: 'Sharma',
  })
  @IsAlphaString()
  lastName: string;

  @ApiProperty({
    type: 'string',
    example: Gender.MALE,
    description: 'Gender ',
  })
  @IsString()
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiProperty({
    type: 'string',
    example: '2004-03-08',
    description: 'YYYY-MM-DD format',
  })
  @IsString()
  @IsOptional()
  @IsValidDate()
  birthDate?: string;

  @IsOptional()
  @ApiProperty({
    type: 'string',
    example: '0x9EED8BdfEfabC54B68Fe62da2e09b7B62E0dF846',
  })
  @IsAlphaString()
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
  @Matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,3}$/g)
  email?: string;

  @ApiProperty({
    type: 'string',
    example: 'lalitpur',
  })
  @IsAlphaString()
  @IsOptional()
  location?: string;

  @ApiProperty({
    type: 'number',
    example: '26.24',
  })
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @ApiProperty({
    type: 'number',
    example: '86.24',
  })
  @IsNumber()
  @IsOptional()
  longitude?: number;

  @ApiProperty({
    type: 'boolean',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  isVulnerable?: boolean;

  @ApiProperty({
    type: 'string',
    example: 'Citizenship',
  })
  @IsString()
  @IsOptional()
  govtIDType?: string;

  @ApiProperty({
    type: 'string',
    example: '1234-4545',
  })
  @IsString()
  @IsOptional()
  govtIDNumber?: string;

  @ApiProperty({
    type: 'string',
    example: 'https://www.google.com/ram.jpg',
  })
  @IsString()
  @IsOptional()
  govtIDPhoto?: string;

  @ApiProperty({
    type: 'string',
    example: 'This is a note to remember',
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({
    type: 'string',
    example: InternetStatus.HOME_INTERNET,
    description: 'Type of internet use ',
  })
  @IsString()
  @IsOptional()
  @IsEnum(InternetStatus)
  internetStatus?: InternetStatus;

  @ApiProperty({
    type: 'string',
    example: BankedStatus.UNBANKED,
  })
  @IsString()
  @IsOptional()
  @IsEnum(BankedStatus)
  bankedStatus?: BankedStatus;

  @ApiProperty({
    type: 'string',
    example: PhoneStatus.SMART_PHONE,
  })
  @IsString()
  @IsOptional()
  @IsEnum(PhoneStatus)
  phoneStatus?: PhoneStatus;

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
