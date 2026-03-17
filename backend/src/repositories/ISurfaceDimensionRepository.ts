import { SurfaceType } from '../entities/DimensionSegment';
import { SurfaceDimension } from '../entities/SurfaceDimension';
import { UpsertSurfaceDimensionDto } from '../dto/surface-dimension/UpsertSurfaceDimensionDto';

export interface ISurfaceDimensionRepository {
  findByRoomAndSurface(roomId: number, surfaceType: SurfaceType): Promise<SurfaceDimension | null>;
  upsert(roomId: number, surfaceType: SurfaceType, dto: UpsertSurfaceDimensionDto): Promise<SurfaceDimension>;
  delete(roomId: number, surfaceType: SurfaceType): Promise<void>;
}
