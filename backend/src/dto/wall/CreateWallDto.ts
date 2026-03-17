import { IsNotEmpty, IsPositive, IsString } from 'class-validator';

export class CreateWallDto {
  @IsNotEmpty() @IsString() label!: string;
  @IsPositive() width!: number;
  @IsPositive() height!: number;
}
