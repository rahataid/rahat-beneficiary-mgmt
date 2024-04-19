import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNotEmptyObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { UUID } from 'crypto';

export class CreateSourceDto {
  @ApiProperty({
    example: 'd32d85a2-8760-4263-8f7e-83a2f1d3c98c',
  })
  @IsUUID()
  @IsOptional()
  uuid!: UUID;

  @ApiProperty({
    example: 'Kobotool',
  })
  @IsString()
  name!: string;

  @ApiProperty({
    example: 'Validate',
  })
  @IsString()
  action!: string;

  @ApiProperty({
    example: 'Kobotool',
  })
  @IsString()
  @IsNotEmpty()
  importId!: string;

  @ApiProperty({
    example: '101',
  })
  @IsString()
  uniqueField?: string;

  @ApiProperty({
    type: 'object',
    example: { data: 'any' },
  })
  @IsOptional()
  details?: any;

  @ApiProperty({
    type: 'object',
    example: {
      data: [
        {
          email: 'alice@mailinator.com',
          phone: '5551234567',
          gender: 'FEMALE',
          lastName: 'Smith',
          birthDate: '1990-05-20T00:00:00.000Z',
          firstName: 'Alice',
        },
      ],
    },
  })
  @IsOptional()
  @IsNotEmptyObject()
  fieldMapping!: any;
}
