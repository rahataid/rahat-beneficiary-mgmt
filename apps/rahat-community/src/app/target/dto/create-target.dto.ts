import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmptyObject, IsOptional, IsString } from 'class-validator';

export class CreateTargetDto {
  @ApiProperty({
    type: 'object',
    example: {},
  })
  @IsOptional()
  query: any;

  @ApiProperty({
    type: 'object',
    example: {},
  })
  @IsOptional()
  extras: any;
}
