import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export enum TargetQueryStatusEnum {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
}

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
