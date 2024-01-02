import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class EditUserDto {
	@ApiProperty({
		example: 'John',
	})
	@IsString()
	@IsOptional()
	firstName?: string;

	@ApiProperty({
		example: 'Doe',
	})
	@IsString()
	@IsOptional()
	lastName?: string;
}
