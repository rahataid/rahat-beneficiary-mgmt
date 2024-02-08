import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export enum TargetQueryStatusEnum {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
}

export class CreateTargetQueryDto {
  @ApiProperty({
    type: 'array',
    example: [{ gender: 'Male' }, { maxAge: 30 }],
  })
  @IsOptional()
  filterOptions: any;
}

export class CreateTargetResultDto {
  @IsString()
  targetUuid: string;

  filterOptions: any;
}
