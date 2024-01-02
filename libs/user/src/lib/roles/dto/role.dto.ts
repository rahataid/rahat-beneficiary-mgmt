import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateRoleDto {
	@ApiProperty({
		example: 'Admin/Manger/User',
	})
	@IsNotEmpty()
	name: string;

	@ApiProperty({
		example: false,
	})
	@IsOptional()
	isSystem?: boolean;
}

export class EditRoleDto {
	@ApiProperty({
		example: 'Admin/Manger/User',
	})
	@IsNotEmpty()
	name: string;

	@ApiProperty({
		example: false,
	})
	@IsOptional()
	isSystem?: boolean;
}

export class CreatePermissionDto {
	@ApiProperty({
		example: 'Create',
	})
	@IsNotEmpty()
	action: string;

	@ApiProperty({
		example: 'user',
	})
	@IsNotEmpty()
	subject: string;

	@ApiProperty({
		example: 2,
	})
	@IsNotEmpty()
	roleId: number;
}

export class UpdatePermissionDto {
	@ApiProperty({
		example: 'Read',
	})
	@IsOptional()
	@IsString()
	action: string;

	@ApiProperty({
		example: 'user',
	})
	@IsOptional()
	@IsString()
	subject: string;

	@ApiProperty({
		example: 3,
	})
	@IsOptional()
	@IsNumber()
	roleId: number;
}
