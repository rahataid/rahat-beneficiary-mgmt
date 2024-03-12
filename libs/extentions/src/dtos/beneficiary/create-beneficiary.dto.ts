import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import {
  BankedStatus,
  Gender,
  InternetStatus,
  PhoneStatus,
} from '@rahataid/community-tool-sdk/enums/';
// enum GenderEnum {
//   MALE = 'MALE',
//   FEMALE = 'FEMALE',
//   OTHER = 'OTHER',
//   UNKNOWN = 'UNKNOWN',
// }

export class BulkInsertDto {
  @ApiProperty({
    type: 'array',
    example: [{ gender: 'MALE' }, { maxAge: 30 }],
  })
  @IsOptional()
  data: any;
}

export class CreateBeneficiaryDto {
  @ApiProperty({
    type: 'string',
    example: 'Ram',
    description: 'firstName',
  })
  @IsString()
  firstName!: string;

  @ApiProperty({
    type: 'string',
    example: 'Sharma',
    description: 'lastName',
  })
  @IsString()
  lastName!: string;

  @ApiProperty({
    type: 'string',
    example: '0x9EED8BdfEfabC54B68Fe62da2e09b7B62E0dF846',
  })
  @IsString()
  walletAddress?: string;

  @ApiProperty({
    type: 'string',
    example: '1997-03-08',
    description: 'Date of birth in the YYYY-MM-DD format.',
  })
  @IsString()
  @IsOptional()
  birthDate?: string;

  @ApiProperty({
    type: 'string',
    example: 'Male',
    description: 'Gender ',
  })
  @IsString()
  @IsOptional()
  gender?: Gender;

  @ApiProperty({
    type: 'string',
    example: 'home_internet',
    description: 'Type of internet use ',
  })
  @IsString()
  @IsOptional()
  internetStatus?: InternetStatus;

  @ApiProperty({
    type: 'string',
    example: 'under_banked',
    description: 'bankedStatus ',
  })
  @IsString()
  @IsOptional()
  bankedStatus?: BankedStatus;

  @ApiProperty({
    type: 'string',
    example: 'featuresPhone',
    description: 'phoneStatus ',
  })
  @IsString()
  @IsOptional()
  phoneStatus?: PhoneStatus;

  @ApiProperty({
    type: 'string',
    example: 'lalitpur',
    description: 'location of the beneficiary',
  })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({
    type: 'number',
    example: '26.24',
    description: 'Latitude of community',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @ApiProperty({
    type: 'number',
    example: '86.24',
    description: 'longitude of community',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  longitude?: number;

  @ApiProperty({
    type: 'string',
    example: '9785623749',
    description: 'Phone number',
    required: false,
  })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({
    type: 'string',
    example: '9785623749',
    description: 'Notes to remember',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({
    type: 'string',
    example: 'ram@mailinator.com',
    description: 'email',
    required: false,
  })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiProperty({
    format: 'json',
    description: 'Additional JSON data',
    required: false,
    example: {
      home: '98670023857',
      work: '36526012',
    },
  })
  @IsOptional()
  extras?: any;
}
