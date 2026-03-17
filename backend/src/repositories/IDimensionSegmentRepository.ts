import { DimensionSegment, SurfaceType } from '../entities/DimensionSegment';

export interface IDimensionSegmentRepository {
  findByRoomAndSurface(roomId: number, surfaceType: SurfaceType): Promise<DimensionSegment[]>;
  findById(id: number): Promise<DimensionSegment | null>;
  save(segment: Partial<DimensionSegment>): Promise<DimensionSegment>;
  delete(id: number): Promise<void>;
}
