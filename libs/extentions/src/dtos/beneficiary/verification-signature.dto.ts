import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { hexToString } from 'viem';

export class VerificationSignatureDTO {
  @ApiProperty({ type: String })
  @IsString()
  @IsOptional()
  signature!: Uint8Array | `0x${string}`;

  @ApiProperty({ type: String })
  @IsString()
  @IsOptional()
  encryptedData!: string;
}
