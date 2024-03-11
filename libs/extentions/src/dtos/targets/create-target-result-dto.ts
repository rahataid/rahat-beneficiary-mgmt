import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateTargetResultDto {
  @ApiProperty({
    type: 'string',
    example: 'e26eab5f-f725-4b5a-b856-bf78a884d7b2',
  })
  @IsString()
  targetUuid!: string;

  @ApiProperty({
    type: 'array',
    example: [{ gender: 'MALE' }, { maxAge: 30 }],
  })
  @IsOptional()
  filterOptions: any;
}
