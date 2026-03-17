import { IDimensionSegmentRepository } from '../repositories/IDimensionSegmentRepository';
import { IRoomRepository } from '../repositories/IRoomRepository';
import { CreateSegmentDto } from '../dto/segment/CreateSegmentDto';
import { UpdateSegmentDto } from '../dto/segment/UpdateSegmentDto';
import { SegmentResponseDto } from '../dto/segment/SegmentResponseDto';
import { AppError } from '../errors/AppError';
import { ErrorCodes } from '../errors/ErrorCodes';
import { DimensionSegment, SurfaceType } from '../entities/DimensionSegment';

function toResponse(s: DimensionSegment): SegmentResponseDto {
  return {
    id: s.id,
    label: s.label,
    measurement: Number(s.measurement),
    width: s.width !== null ? Number(s.width) : null,
    length: s.length !== null ? Number(s.length) : null,
    surfaceType: s.surfaceType,
    createdAt: s.createdAt.toISOString(),
  };
}

export class DimensionSegmentService {
  constructor(
    private readonly segmentRepo: IDimensionSegmentRepository,
    private readonly roomRepo: IRoomRepository,
  ) {}

  async getSegments(roomId: number, surfaceType: SurfaceType): Promise<SegmentResponseDto[]> {
    const segments = await this.segmentRepo.findByRoomAndSurface(roomId, surfaceType);
    return segments.map(toResponse);
  }

  async addSegment(roomId: number, dto: CreateSegmentDto): Promise<SegmentResponseDto> {
    const room = await this.roomRepo.findById(roomId);
    if (!room) throw new AppError(ErrorCodes.NOT_FOUND, `Room ${roomId} not found`);
    const saved = await this.segmentRepo.save({ ...dto, roomId });
    return toResponse(saved);
  }

  async updateSegment(roomId: number, segId: number, dto: UpdateSegmentDto): Promise<SegmentResponseDto> {
    const seg = await this.segmentRepo.findById(segId);
    if (!seg || seg.roomId !== roomId) {
      throw new AppError(ErrorCodes.NOT_FOUND, `Segment ${segId} not found`);
    }
    const updated = await this.segmentRepo.save({ ...seg, ...dto });
    return toResponse(updated);
  }

  async deleteSegment(roomId: number, segId: number): Promise<void> {
    const seg = await this.segmentRepo.findById(segId);
    if (!seg || seg.roomId !== roomId) {
      throw new AppError(ErrorCodes.NOT_FOUND, `Segment ${segId} not found`);
    }
    await this.segmentRepo.delete(segId);
  }
}
