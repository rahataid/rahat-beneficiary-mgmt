import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    type: 'string',
    example: 'rahat',
    description: 'Community Category',
  })
  @IsString()
  @IsOptional()
  name: string;

  @IsOptional()
  @IsNumber()
  id: number;
}
