import { IsNotEmpty, IsOptional, IsString, ValidateIf } from 'class-validator';

export class UpdateRoomDto {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  label?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  floor?: string;
}
