import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString } from 'class-validator';

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
  isSystem!: boolean;
}
