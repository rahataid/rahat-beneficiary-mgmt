import { ApiProperty } from '@nestjs/swagger';
import { Enums, ImportField } from '@rahataid/community-tool-sdk';
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
}
