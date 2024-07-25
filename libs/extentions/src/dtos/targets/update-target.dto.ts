import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import { CreateTargetQueryDto } from './create-target-query.dto';

export class UpdateTargetDto extends PartialType(CreateTargetQueryDto) {}

export class updateTargetQueryLabelDTO {
  @ApiProperty({
    type: 'string',
    example: 'My Target',
  })
  @IsString()
  @IsNotEmpty()
  label!: string;

  @ApiProperty({
    type: 'string',
    example: 'a1b2c3d4-1234-5678-1234-567812345678',
  })
  createdBy?: string;

  @IsObject()
  @IsOptional()
  @ApiProperty({
    type: 'array',
    example: { gender: 'MALE', ward_no: 10 },
  })
  targetingCriteria?: Record<string, any>;
}
