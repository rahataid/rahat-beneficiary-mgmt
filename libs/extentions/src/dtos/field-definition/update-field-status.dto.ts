import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class updateFieldStatusDto {
  @ApiProperty({
    example: false,
  })
  @IsBoolean()
  @IsNotEmpty()
  isActive!: boolean;
}
