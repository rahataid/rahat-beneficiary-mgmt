import { IsNotEmpty } from 'class-validator';

export class SourceCreatedDto {
  @IsNotEmpty()
  sourceUUID: string;
}
