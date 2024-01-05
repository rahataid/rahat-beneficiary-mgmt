import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNumber, IsOptional, IsString } from 'class-validator';

enum Gender {
  Male = 'Male',
  Female = 'Female',
  Others = 'Others',
}
export class CreateBeneficiaryDto {
  @ApiProperty({
    type: 'string',
    example: 'Ram',
    description: 'firstName',
  })
  @IsString()
  firstName: string;

  @ApiProperty({
    type: 'string',
    example: 'Sharma',
    description: 'lastName',
  })
  @IsString()
  lastName: string;

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
  extras?: string;
}
