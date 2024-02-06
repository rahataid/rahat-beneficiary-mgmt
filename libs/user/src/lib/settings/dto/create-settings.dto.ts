import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSettingsDto {
  @ApiProperty({
    example: 'Email Config',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    example: 'host,port,username,password',
  })
  @IsString()
  @IsOptional()
  requiredFields: any;

  @ApiProperty({
    type: 'object',
    example: {
      key1: 'value1',
      key2: 'value2',
    },
  })
  @IsNotEmpty()
  value!: Record<string, any>;

  @ApiProperty({
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isReadOnly!: boolean;

  @ApiProperty({
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isPrivate!: boolean;
}
