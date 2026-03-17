import { IsNumber, IsPositive } from 'class-validator';

export class UpsertSurfaceDimensionDto {
  @IsNumber()
  @IsPositive()
  width!: number;

  @IsNumber()
  @IsPositive()
  length!: number;
}
