import { SurfaceType } from '../entities/DimensionSegment';
import { SurfaceDimension } from '../entities/SurfaceDimension';
import { UpsertSurfaceDimensionDto } from '../dto/surface-dimension/UpsertSurfaceDimensionDto';
import { SurfaceDimensionResponseDto } from '../dto/surface-dimension/SurfaceDimensionResponseDto';
import { ISurfaceDimensionRepository } from '../repositories/ISurfaceDimensionRepository';
import { IRoomRepository } from '../repositories/IRoomRepository';
import { AppError } from '../errors/AppError';
import { ErrorCodes } from '../errors/ErrorCodes';

const toResponse = (sd: SurfaceDimension): SurfaceDimensionResponseDto => ({
  id: sd.id,
  surfaceType: sd.surfaceType,
  width: Number(sd.width),
  length: Number(sd.length),
  roomId: sd.roomId,
  createdAt: sd.createdAt.toISOString(),
  updatedAt: sd.updatedAt.toISOString(),
});

export class SurfaceDimensionService {
  constructor(
    private readonly sdRepo: ISurfaceDimensionRepository,
    private readonly roomRepo: IRoomRepository,
  ) {}

  async getForRoom(roomId: number, surfaceType: SurfaceType): Promise<SurfaceDimensionResponseDto> {
    const room = await this.roomRepo.findById(roomId);
    if (!room) throw new AppError(ErrorCodes.NOT_FOUND, `Room ${roomId} not found`);

    const sd = await this.sdRepo.findByRoomAndSurface(roomId, surfaceType);
    if (!sd) throw new AppError(ErrorCodes.NOT_FOUND, `No ${surfaceType} dimension set for room ${roomId}`);

    return toResponse(sd);
  }

  async upsert(
    roomId: number,
    surfaceType: SurfaceType,
    dto: UpsertSurfaceDimensionDto,
  ): Promise<SurfaceDimensionResponseDto> {
    const room = await this.roomRepo.findById(roomId);
    if (!room) throw new AppError(ErrorCodes.NOT_FOUND, `Room ${roomId} not found`);

    const sd = await this.sdRepo.upsert(roomId, surfaceType, dto);
    return toResponse(sd);
  }

  async delete(roomId: number, surfaceType: SurfaceType): Promise<void> {
    const room = await this.roomRepo.findById(roomId);
    if (!room) throw new AppError(ErrorCodes.NOT_FOUND, `Room ${roomId} not found`);

    const existing = await this.sdRepo.findByRoomAndSurface(roomId, surfaceType);
    if (!existing) throw new AppError(ErrorCodes.NOT_FOUND, `No ${surfaceType} dimension set for room ${roomId}`);

    await this.sdRepo.delete(roomId, surfaceType);
  }
}
