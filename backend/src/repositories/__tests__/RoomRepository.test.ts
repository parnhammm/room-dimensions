import { DataSource, Repository } from 'typeorm';
import { RoomRepository } from '../RoomRepository';
import { Room } from '../../entities/Room';

function makeMockRepo(overrides: Partial<Repository<Room>> = {}): Repository<Room> {
  return {
    find: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue(null),
    save: jest.fn(),
    delete: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  } as unknown as Repository<Room>;
}

function makeMockDataSource(mockRepo: Repository<Room>): DataSource {
  return {
    getRepository: jest.fn().mockReturnValue(mockRepo),
  } as unknown as DataSource;
}

describe('RoomRepository', () => {
  it('findAll returns rooms ordered', async () => {
    const room = { id: 1, label: 'Kitchen', floor: 'Ground', createdAt: new Date(), updatedAt: new Date() } as Room;
    const mockRepo = makeMockRepo({ find: jest.fn().mockResolvedValue([room]) });
    const repo = new RoomRepository(makeMockDataSource(mockRepo));
    const result = await repo.findAll();
    expect(result).toEqual([room]);
    expect(mockRepo.find).toHaveBeenCalledWith({ order: { floor: 'ASC', createdAt: 'ASC' } });
  });

  it('findById returns room when found', async () => {
    const room = { id: 1 } as Room;
    const mockRepo = makeMockRepo({ findOne: jest.fn().mockResolvedValue(room) });
    const repo = new RoomRepository(makeMockDataSource(mockRepo));
    const result = await repo.findById(1);
    expect(result).toEqual(room);
  });

  it('findById returns null when not found', async () => {
    const mockRepo = makeMockRepo({ findOne: jest.fn().mockResolvedValue(null) });
    const repo = new RoomRepository(makeMockDataSource(mockRepo));
    const result = await repo.findById(99);
    expect(result).toBeNull();
  });

  it('save calls repo.save and returns result', async () => {
    const room = { id: 1, label: 'Kitchen' } as Room;
    const mockRepo = makeMockRepo({ save: jest.fn().mockResolvedValue(room) });
    const repo = new RoomRepository(makeMockDataSource(mockRepo));
    const result = await repo.save({ label: 'Kitchen', floor: 'Ground' });
    expect(result).toEqual(room);
  });

  it('delete calls repo.delete', async () => {
    const mockRepo = makeMockRepo({ delete: jest.fn().mockResolvedValue({ affected: 1 }) });
    const repo = new RoomRepository(makeMockDataSource(mockRepo));
    await repo.delete(1);
    expect(mockRepo.delete).toHaveBeenCalledWith(1);
  });
});
