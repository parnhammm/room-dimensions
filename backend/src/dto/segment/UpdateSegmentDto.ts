import { IsNotEmpty, IsOptional, IsPositive, IsString } from 'class-validator';

export class UpdateSegmentDto {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  label?: string;

  @IsOptional()
  @IsPositive()
  measurement?: number;
}
