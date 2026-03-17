import { DataSource, Repository } from 'typeorm';
import { WallRepository } from '../WallRepository';
import { Wall } from '../../entities/Wall';

function makeMockRepo(overrides: Partial<Repository<Wall>> = {}): Repository<Wall> {
  return {
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue(null),
    save: jest.fn(),
    delete: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  } as unknown as Repository<Wall>;
}

function makeMockDataSource(mockRepo: Repository<Wall>): DataSource {
  return { getRepository: jest.fn().mockReturnValue(mockRepo) } as unknown as DataSource;
}

describe('WallRepository', () => {
  it('findByRoom orders by createdAt ASC', async () => {
    const wall = { id: 1, roomId: 1, createdAt: new Date() } as Wall;
    const mockRepo = makeMockRepo({ find: jest.fn().mockResolvedValue([wall]) });
    const repo = new WallRepository(makeMockDataSource(mockRepo));
    const result = await repo.findByRoom(1);
    expect(result).toEqual([wall]);
    expect(mockRepo.find).toHaveBeenCalledWith({ where: { roomId: 1 }, order: { createdAt: 'ASC' } });
  });

  it('findById returns wall when found', async () => {
    const wall = { id: 1 } as Wall;
    const mockRepo = makeMockRepo({ findOne: jest.fn().mockResolvedValue(wall) });
    const repo = new WallRepository(makeMockDataSource(mockRepo));
    expect(await repo.findById(1)).toEqual(wall);
  });

  it('findByIdWithWindows includes windows relation', async () => {
    const wall = { id: 1, windows: [] } as unknown as Wall;
    const mockRepo = makeMockRepo({ findOne: jest.fn().mockResolvedValue(wall) });
    const repo = new WallRepository(makeMockDataSource(mockRepo));
    const result = await repo.findByIdWithWindows(1);
    expect(result).toEqual(wall);
  });

  it('save persists wall', async () => {
    const wall = { id: 1 } as Wall;
    const mockRepo = makeMockRepo({ save: jest.fn().mockResolvedValue(wall) });
    const repo = new WallRepository(makeMockDataSource(mockRepo));
    expect(await repo.save({ label: 'North', width: 5, height: 2.4, roomId: 1 })).toEqual(wall);
  });

  it('delete calls repo.delete', async () => {
    const mockRepo = makeMockRepo({ delete: jest.fn().mockResolvedValue({ affected: 1 }) });
    const repo = new WallRepository(makeMockDataSource(mockRepo));
    await repo.delete(1);
    expect(mockRepo.delete).toHaveBeenCalledWith(1);
  });
});
