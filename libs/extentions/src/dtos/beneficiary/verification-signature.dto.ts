import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class VerificationSignatureDTO {
  @ApiProperty({ type: String })
  @IsString()
  signature!: Uint8Array | `0x${string}`;

  @ApiProperty({ type: String })
  @IsString()
  encryptedData!: string;
}
