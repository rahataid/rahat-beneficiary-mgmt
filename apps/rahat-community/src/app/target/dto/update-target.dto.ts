import { PartialType } from '@nestjs/mapped-types';
import { CreateTargetDto } from './create-target.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateTargetDto extends PartialType(CreateTargetDto) {}

export class updateTargetQueryLabelDTO {
  @ApiProperty({
    type: 'string',
    example: 'My Target',
  })
  @IsString()
  @IsNotEmpty()
  label: string;
}
