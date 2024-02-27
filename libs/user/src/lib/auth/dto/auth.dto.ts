import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class SignupDto {
  @ApiProperty({
    example: 'binod@mailinator.com',
  })
  @IsString()
  @IsNotEmpty()
  authAddress: string;

  @ApiProperty({
    example: 'Email/Phone/Wallet',
  })
  @IsString()
  authType: string;

  @ApiProperty({
    example: 3,
  })
  @IsOptional()
  @IsNumber()
  roleId: number;

  @ApiProperty({
    example: 'Binod',
  })
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    example: 'Chaudhary',
  })
  @IsNotEmpty()
  lastName: string;
}

export class OtpDto {
  @ApiProperty({
    example: 'binod@mailinator.com',
  })
  @IsString()
  @IsNotEmpty()
  authAddress: string;
}

export class LoginDto {
  @ApiProperty({
    example: 'binod@mailinator.com',
  })
  @IsString()
  @IsNotEmpty()
  authAddress: string;

  @ApiProperty({
    example: '123456',
  })
  @IsString()
  @IsNotEmpty()
  otp: string;
}

export class WalletLoginDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: 'string',
    example:
      '0xaa38ee9f193186448c50734de746babd7b6cb272f10749c9130cc7316235dcc4366c4892733e3f162acfce829c14d4cbbe49a7b2e72022908af3f1bdef8a4eb31c',
    description: 'signature',
    required: true,
  })
  signature: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: 'string',
    example: 'hello world!',
    description: 'message',
  })
  message: string;
}
