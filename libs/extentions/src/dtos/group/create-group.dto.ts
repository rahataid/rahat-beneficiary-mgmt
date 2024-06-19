import { ApiProperty } from '@nestjs/swagger';
import { GroupOrigins } from '@rahataid/community-tool-sdk';
import {
  IsBoolean,
  IsString,
  IsOptional,
  IsArray,
  IsEmpty,
} from 'class-validator';

export class CreateGroupDto {
  @ApiProperty({
    type: 'string',
    example: 'kathmandu',
    description: 'grp name ',
  })
  @IsString()
  name!: string;

  @ApiProperty({
    type: 'boolean',
    example: false,
    description: 'Cant delete this group if true',
  })
  @IsBoolean()
  @IsOptional()
  isSystem?: boolean;

  @ApiProperty({
    type: 'boolean',
    example: false,
    description: 'Track if created by system or manaully',
  })
  @IsBoolean()
  @IsOptional()
  autoCreated?: boolean;

  @ApiProperty({
    type: 'string',
    example: 'a1b2c3d4-1234-5678-1234-567812345678',
  })
  createdBy?: string;

  @ApiProperty({
    type: 'array',
    example: [GroupOrigins.TARGETING],
  })
  @IsArray()
  @IsOptional()
  origins?: string[];
}
