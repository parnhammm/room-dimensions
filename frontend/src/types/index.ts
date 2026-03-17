export type Unit = 'm' | 'cm' | 'ft' | 'in';

export type SurfaceType = 'floor' | 'ceiling';

export interface SurfaceDimensionResponse {
  id: number;
  surfaceType: SurfaceType;
  width: number;
  length: number;
  roomId: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertSurfaceDimensionRequest {
  width: number;
  length: number;
}

export interface RoomResponse {
  id: number;
  label: string;
  floor: string;
  createdAt: string;
  updatedAt: string;
}

export interface SegmentResponse {
  id: number;
  label: string;
  measurement: number;
  width: number | null;
  length: number | null;
  surfaceType: 'floor' | 'ceiling';
  createdAt: string;
}

export interface WallSummaryResponse {
  id: number;
  label: string;
  width: number;
  height: number;
  createdAt: string;
  updatedAt: string;
}

export interface WindowResponse {
  id: number;
  label: string;
  width: number;
  height: number;
  createdAt: string;
  updatedAt: string;
}

export interface WallDetailResponse extends WallSummaryResponse {
  windows: WindowResponse[];
}

export interface RoomDetailResponse extends RoomResponse {
  floorSegments: SegmentResponse[];
  ceilingSegments: SegmentResponse[];
  walls: WallSummaryResponse[];
  floorDimension: SurfaceDimensionResponse | null;
  ceilingDimension: SurfaceDimensionResponse | null;
}

export interface SettingsResponse {
  measurementUnit: Unit;
}

export interface PrintFloorRoom {
  id: number;
  label: string;
  floorSegments: SegmentResponse[];
  ceilingSegments: SegmentResponse[];
  walls: WallDetailResponse[];
  floorDimension: SurfaceDimensionResponse | null;
  ceilingDimension: SurfaceDimensionResponse | null;
}

export interface PrintFloor {
  floor: string;
  rooms: PrintFloorRoom[];
}

export interface PrintSummaryResponse {
  unit: Unit;
  floors: PrintFloor[];
}

export interface ApiError {
  code: string;
  message: string;
}
