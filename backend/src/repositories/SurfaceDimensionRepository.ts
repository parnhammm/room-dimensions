import { DataSource, Repository } from 'typeorm';
import { SurfaceType } from '../entities/DimensionSegment';
import { SurfaceDimension } from '../entities/SurfaceDimension';
import { UpsertSurfaceDimensionDto } from '../dto/surface-dimension/UpsertSurfaceDimensionDto';
import { ISurfaceDimensionRepository } from './ISurfaceDimensionRepository';

export class SurfaceDimensionRepository implements ISurfaceDimensionRepository {
  private readonly repo: Repository<SurfaceDimension>;

  constructor(dataSource: DataSource) {
    this.repo = dataSource.getRepository(SurfaceDimension);
  }

  async findByRoomAndSurface(roomId: number, surfaceType: SurfaceType): Promise<SurfaceDimension | null> {
    return this.repo.findOne({ where: { roomId, surfaceType } });
  }

  async upsert(roomId: number, surfaceType: SurfaceType, dto: UpsertSurfaceDimensionDto): Promise<SurfaceDimension> {
    const existing = await this.repo.findOne({ where: { roomId, surfaceType } });
    if (existing) {
      existing.width = dto.width;
      existing.length = dto.length;
      return this.repo.save(existing);
    }
    const created = this.repo.create({ roomId, surfaceType, width: dto.width, length: dto.length });
    return this.repo.save(created);
  }

  async delete(roomId: number, surfaceType: SurfaceType): Promise<void> {
    await this.repo.delete({ roomId, surfaceType });
  }
}
