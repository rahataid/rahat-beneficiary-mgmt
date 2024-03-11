import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export enum TargetQueryStatusEnum {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
}

export class CreateTargetQueryDto {
  @ApiProperty({
    type: 'array',
    example: [{ gender: 'MALE' }, { maxAge: 30 }],
  })
  @IsOptional()
  filterOptions: any;
}
