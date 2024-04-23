import { ApiProperty } from '@nestjs/swagger';
import { Enums } from '@rahataid/community-tool-sdk';
import {
  IsEnum,
  IsNotEmpty,
  IsNotEmptyObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { ImportField } from 'libs/sdk/src/enums';

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
    example: ImportField.UUID,
  })
  @IsEnum(Enums.ImportField)
  importField?: ImportField;

  @IsOptional()
  @IsNotEmptyObject()
  fieldMapping!: any;
}
