import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class CreateTagsDto {
  @ApiProperty({
    type: 'array',
    items: {
      type: 'string',
    },
    example: ['Tag', '2Tag2'],
    description: 'Array of tags',
    required: true,
  })
  @IsArray()
  @IsString({ each: true })
  tags: string[];
}
