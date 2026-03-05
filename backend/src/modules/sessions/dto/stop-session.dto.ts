import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  Max,
  MaxLength,
} from "class-validator";

export class StopSessionDto {
  @IsOptional() @IsString() @MaxLength(100) subject?: string;
  @IsOptional() @IsString() @MaxLength(500) memo?: string;
  @IsOptional() @IsInt() @Min(1) @Max(5) rating?: number;
}
