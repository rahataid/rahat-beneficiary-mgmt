import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { CreateManagerDto } from './create-manager.dto';

export class UpdateManagerDto extends PartialType(CreateManagerDto) {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  communityName: string;
}
