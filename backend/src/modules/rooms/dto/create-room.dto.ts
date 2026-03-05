import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  IsArray,
  MaxLength,
  Min,
  Max,
} from "class-validator";

export class CreateRoomDto {
  @IsString() @MaxLength(100) name: string;
  @IsOptional() @IsString() @MaxLength(500) description?: string;
  @IsOptional() @IsBoolean() isPrivate?: boolean;
  @IsOptional() @IsString() password?: string;
  @IsOptional() @IsInt() @Min(2) @Max(100) maxMembers?: number;
  @IsOptional() @IsArray() @IsString({ each: true }) tags?: string[];
}
