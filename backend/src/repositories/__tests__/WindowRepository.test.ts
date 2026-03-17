import { DataSource, Repository } from 'typeorm';
import { WindowRepository } from '../WindowRepository';
import { Window } from '../../entities/Window';

function makeMockRepo(overrides: Partial<Repository<Window>> = {}): Repository<Window> {
  return {
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue(null),
    save: jest.fn(),
    delete: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  } as unknown as Repository<Window>;
}

function makeMockDataSource(mockRepo: Repository<Window>): DataSource {
  return { getRepository: jest.fn().mockReturnValue(mockRepo) } as unknown as DataSource;
}

describe('WindowRepository', () => {
  it('findByWall orders by createdAt ASC', async () => {
    const win = { id: 1, wallId: 1, createdAt: new Date() } as Window;
    const mockRepo = makeMockRepo({ find: jest.fn().mockResolvedValue([win]) });
    const repo = new WindowRepository(makeMockDataSource(mockRepo));
    const result = await repo.findByWall(1);
    expect(result).toEqual([win]);
    expect(mockRepo.find).toHaveBeenCalledWith({ where: { wallId: 1 }, order: { createdAt: 'ASC' } });
  });

  it('findById returns window when found', async () => {
    const win = { id: 1 } as Window;
    const mockRepo = makeMockRepo({ findOne: jest.fn().mockResolvedValue(win) });
    const repo = new WindowRepository(makeMockDataSource(mockRepo));
    expect(await repo.findById(1)).toEqual(win);
  });

  it('findById returns null when not found', async () => {
    const mockRepo = makeMockRepo();
    const repo = new WindowRepository(makeMockDataSource(mockRepo));
    expect(await repo.findById(99)).toBeNull();
  });

  it('save persists window', async () => {
    const win = { id: 1 } as Window;
    const mockRepo = makeMockRepo({ save: jest.fn().mockResolvedValue(win) });
    const repo = new WindowRepository(makeMockDataSource(mockRepo));
    expect(await repo.save({ label: 'Bay', width: 1.2, height: 1.0, wallId: 1 })).toEqual(win);
  });

  it('delete calls repo.delete', async () => {
    const mockRepo = makeMockRepo({ delete: jest.fn().mockResolvedValue({ affected: 1 }) });
    const repo = new WindowRepository(makeMockDataSource(mockRepo));
    await repo.delete(1);
    expect(mockRepo.delete).toHaveBeenCalledWith(1);
  });
});
