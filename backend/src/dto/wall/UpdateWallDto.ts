import { IsNotEmpty, IsOptional, IsPositive, IsString } from 'class-validator';

export class UpdateWallDto {
  @IsOptional() @IsNotEmpty() @IsString() label?: string;
  @IsOptional() @IsPositive() width?: number;
  @IsOptional() @IsPositive() height?: number;
}
