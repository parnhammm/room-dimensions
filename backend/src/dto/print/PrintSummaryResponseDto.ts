import { MeasurementUnit } from '../../constants/units';
import { SegmentResponseDto } from '../segment/SegmentResponseDto';
import { WallDetailResponseDto } from '../wall/WallDetailResponseDto';
import { SurfaceDimensionResponseDto } from '../surface-dimension/SurfaceDimensionResponseDto';

export interface PrintFloorRoom {
  id: number;
  label: string;
  floorSegments: SegmentResponseDto[];
  ceilingSegments: SegmentResponseDto[];
  walls: WallDetailResponseDto[];
  floorDimension: SurfaceDimensionResponseDto | null;
  ceilingDimension: SurfaceDimensionResponseDto | null;
}

export interface PrintFloor {
  floor: string;
  rooms: PrintFloorRoom[];
}

export interface PrintSummaryResponseDto {
  unit: MeasurementUnit;
  floors: PrintFloor[];
}
