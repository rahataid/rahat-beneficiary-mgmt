import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class DownloadGroupDto {
  @ApiPropertyOptional({
    description:
      'Comma-separated list of field names to include. Omit for all fields.',
    example: 'uuid,firstName,lastName,phone,gender',
  })
  @IsOptional()
  @IsString()
  fields?: string;
}
