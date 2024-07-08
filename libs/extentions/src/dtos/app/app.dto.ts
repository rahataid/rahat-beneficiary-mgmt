import { ApiProperty } from '@nestjs/swagger';

import { IsBoolean, IsString } from 'class-validator';

export class UpdateUserAgreementDto {
  constructor() {}

  @ApiProperty({
    type: 'boolean',
    example: true,
  })
  @IsBoolean()
  agreedTOS!: boolean;

  @ApiProperty({
    type: 'string',
    example: 'a1b2c3d4-1234-5678-1234-567812345678',
  })
  @IsString()
  userId!: string;
}
