import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

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
