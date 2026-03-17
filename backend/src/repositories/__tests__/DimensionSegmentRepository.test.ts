import { DataSource, Repository } from 'typeorm';
import { DimensionSegmentRepository } from '../DimensionSegmentRepository';
import { DimensionSegment } from '../../entities/DimensionSegment';

function makeMockRepo(overrides: Partial<Repository<DimensionSegment>> = {}): Repository<DimensionSegment> {
  return {
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue(null),
    save: jest.fn(),
    delete: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  } as unknown as Repository<DimensionSegment>;
}

function makeMockDataSource(mockRepo: Repository<DimensionSegment>): DataSource {
  return { getRepository: jest.fn().mockReturnValue(mockRepo) } as unknown as DataSource;
}

describe('DimensionSegmentRepository', () => {
  it('findByRoomAndSurface orders by createdAt ASC', async () => {
    const seg = { id: 1, roomId: 1, surfaceType: 'floor', createdAt: new Date() } as DimensionSegment;
    const mockRepo = makeMockRepo({ find: jest.fn().mockResolvedValue([seg]) });
    const repo = new DimensionSegmentRepository(makeMockDataSource(mockRepo));
    const result = await repo.findByRoomAndSurface(1, 'floor');
    expect(result).toEqual([seg]);
    expect(mockRepo.find).toHaveBeenCalledWith({
      where: { roomId: 1, surfaceType: 'floor' },
      order: { createdAt: 'ASC' },
    });
  });

  it('findById returns segment when found', async () => {
    const seg = { id: 1 } as DimensionSegment;
    const mockRepo = makeMockRepo({ findOne: jest.fn().mockResolvedValue(seg) });
    const repo = new DimensionSegmentRepository(makeMockDataSource(mockRepo));
    expect(await repo.findById(1)).toEqual(seg);
  });

  it('findById returns null when not found', async () => {
    const mockRepo = makeMockRepo();
    const repo = new DimensionSegmentRepository(makeMockDataSource(mockRepo));
    expect(await repo.findById(99)).toBeNull();
  });

  it('save persists segment', async () => {
    const seg = { id: 1, label: 'North' } as DimensionSegment;
    const mockRepo = makeMockRepo({ save: jest.fn().mockResolvedValue(seg) });
    const repo = new DimensionSegmentRepository(makeMockDataSource(mockRepo));
    expect(await repo.save({ label: 'North', measurement: 5, surfaceType: 'floor', roomId: 1 })).toEqual(seg);
  });

  it('delete calls repo.delete', async () => {
    const mockRepo = makeMockRepo({ delete: jest.fn().mockResolvedValue({ affected: 1 }) });
    const repo = new DimensionSegmentRepository(makeMockDataSource(mockRepo));
    await repo.delete(1);
    expect(mockRepo.delete).toHaveBeenCalledWith(1);
  });
});
