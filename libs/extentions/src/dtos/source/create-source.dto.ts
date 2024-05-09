import { ApiProperty } from '@nestjs/swagger';
import { Enums } from '@rahataid/community-tool-sdk';
import {
  IsEnum,
  IsNotEmpty,
  IsNotEmptyObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateSourceDto {
  @ApiProperty({
    example: 'Kobotool',
  })
  @IsString()
  name!: string;

  @ApiProperty({
    example: 'Validate',
  })
  @IsString()
  @IsOptional()
  action?: string;

  @ApiProperty({
    example: 'Kobotool',
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  importId!: string;

  @ApiProperty({
    example: Enums.ImportField.UUID,
  })
  @IsEnum(Enums.ImportField)
  @IsOptional()
  importField?: Enums.ImportField;

  @IsOptional()
  @IsNotEmptyObject()
  fieldMapping!: any;

  @ApiProperty({
    type: 'string',
    example: 'a1b2c3d4-1234-5678-1234-567812345678',
  })
  @IsOptional()
  createdBy?: string;
}
