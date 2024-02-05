import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export enum TargetQueryStatusEnum {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
}

export class CreateTargetDto {
  @ApiProperty({
    type: 'array',
    example: [{ gender: 'Male' }, { maxAge: 30 }],
  })
  @IsOptional()
  filter_options: any;
}
