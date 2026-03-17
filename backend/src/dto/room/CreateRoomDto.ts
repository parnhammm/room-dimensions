import { IsNotEmpty, IsString } from 'class-validator';

export class CreateRoomDto {
  @IsNotEmpty()
  @IsString()
  label!: string;

  @IsNotEmpty()
  @IsString()
  floor!: string;
}
