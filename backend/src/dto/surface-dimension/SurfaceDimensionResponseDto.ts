import { SurfaceType } from '../../entities/DimensionSegment';

export class SurfaceDimensionResponseDto {
  id!: number;
  surfaceType!: SurfaceType;
  width!: number;
  length!: number;
  roomId!: number;
  createdAt!: string;
  updatedAt!: string;
}
