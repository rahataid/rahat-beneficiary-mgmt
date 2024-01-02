import { IsString, IsNotEmpty } from 'class-validator';

export class SendOTPDto {
	@IsString()
	@IsNotEmpty()
	name: string;

	@IsString()
	@IsNotEmpty()
	otp: string;

	@IsString()
	@IsNotEmpty()
	to: string;

	@IsString()
	subject: string;

	@IsString()
	@IsNotEmpty()
	template: string;
}
