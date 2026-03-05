import { IsString, IsOptional, MaxLength } from "class-validator";

export class StartSessionDto {
  @IsString() @MaxLength(100) subject: string;
  @IsOptional() @IsString() roomId?: string;
}
