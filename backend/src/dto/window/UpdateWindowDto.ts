import { IsNotEmpty, IsOptional, IsPositive, IsString } from 'class-validator';

export class UpdateWindowDto {
  @IsOptional() @IsNotEmpty() @IsString() label?: string;
  @IsOptional() @IsPositive() width?: number;
  @IsOptional() @IsPositive() height?: number;
}
