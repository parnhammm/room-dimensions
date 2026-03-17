import { IsIn, IsNotEmpty, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateSegmentDto {
  @IsNotEmpty()
  @IsString()
  label!: string;

  @IsPositive()
  measurement!: number;

  @IsIn(['floor', 'ceiling'])
  surfaceType!: 'floor' | 'ceiling';

  @IsOptional()
  @IsPositive()
  width?: number;

  @IsOptional()
  @IsPositive()
  length?: number;
}
