import { SegmentResponseDto } from '../segment/SegmentResponseDto';
import { WallSummaryResponseDto } from '../wall/WallSummaryResponseDto';
import { SurfaceDimensionResponseDto } from '../surface-dimension/SurfaceDimensionResponseDto';

export class RoomDetailResponseDto {
  id!: number;
  label!: string;
  floor!: string;
  createdAt!: string;
  updatedAt!: string;
  floorSegments!: SegmentResponseDto[];
  ceilingSegments!: SegmentResponseDto[];
  walls!: WallSummaryResponseDto[];
  floorDimension!: SurfaceDimensionResponseDto | null;
  ceilingDimension!: SurfaceDimensionResponseDto | null;
}
