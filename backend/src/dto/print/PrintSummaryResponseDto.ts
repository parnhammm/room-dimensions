import { MeasurementUnit } from '../../constants/units';
import { SegmentResponseDto } from '../segment/SegmentResponseDto';
import { WallDetailResponseDto } from '../wall/WallDetailResponseDto';

export interface PrintFloorRoom {
  id: number;
  label: string;
  floorSegments: SegmentResponseDto[];
  ceilingSegments: SegmentResponseDto[];
  walls: WallDetailResponseDto[];
}

export interface PrintFloor {
  floor: string;
  rooms: PrintFloorRoom[];
}

export interface PrintSummaryResponseDto {
  unit: MeasurementUnit;
  floors: PrintFloor[];
}
