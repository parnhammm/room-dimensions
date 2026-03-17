import { DataSource, Repository } from 'typeorm';
import { DimensionSegment, SurfaceType } from '../entities/DimensionSegment';
import { IDimensionSegmentRepository } from './IDimensionSegmentRepository';

export class DimensionSegmentRepository implements IDimensionSegmentRepository {
  private readonly repo: Repository<DimensionSegment>;

  constructor(dataSource: DataSource) {
    this.repo = dataSource.getRepository(DimensionSegment);
  }

  async findByRoomAndSurface(roomId: number, surfaceType: SurfaceType): Promise<DimensionSegment[]> {
    return this.repo.find({
      where: { roomId, surfaceType },
      order: { createdAt: 'ASC' },
    });
  }

  async findById(id: number): Promise<DimensionSegment | null> {
    return this.repo.findOne({ where: { id } });
  }

  async save(segment: Partial<DimensionSegment>): Promise<DimensionSegment> {
    return this.repo.save(segment);
  }

  async delete(id: number): Promise<void> {
    await this.repo.delete(id);
  }
}
