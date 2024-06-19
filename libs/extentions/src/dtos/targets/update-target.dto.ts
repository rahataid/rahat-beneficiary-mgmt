import { PartialType } from '@nestjs/mapped-types';
import { CreateTargetQueryDto } from './create-target-query.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

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
}
