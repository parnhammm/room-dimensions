import { RoomService } from '../../src/services/RoomService';
import { IRoomRepository } from '../../src/repositories/IRoomRepository';
import { Room } from '../../src/entities/Room';
import { ErrorCodes } from '../../src/errors/ErrorCodes';
import { AppError } from '../../src/errors/AppError';

function makeRoom(overrides: Partial<Room> = {}): Room {
  return {
    id: 1,
    label: 'Kitchen',
    floor: 'Ground Floor',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    walls: [],
    dimensionSegments: [],
    ...overrides,
  } as Room;
}

function makeMockRepo(overrides: Partial<IRoomRepository> = {}): IRoomRepository {
  return {
    findAll: jest.fn().mockResolvedValue([]),
    findById: jest.fn().mockResolvedValue(null),
    findByIdWithRelations: jest.fn().mockResolvedValue(null),
    findAllWithRelations: jest.fn().mockResolvedValue([]),
    save: jest.fn(),
    delete: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe('RoomService', () => {
  describe('listRooms', () => {
    it('returns mapped room responses', async () => {
      const room = makeRoom();
      const repo = makeMockRepo({ findAll: jest.fn().mockResolvedValue([room]) });
      const service = new RoomService(repo);
      const start = Date.now();
      const result = await service.listRooms();
      expect(Date.now() - start).toBeLessThan(2000);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
      expect(result[0].label).toBe('Kitchen');
    });
  });

  describe('createRoom', () => {
    it('saves and returns new room', async () => {
      const room = makeRoom();
      const repo = makeMockRepo({ save: jest.fn().mockResolvedValue(room) });
      const service = new RoomService(repo);
      const result = await service.createRoom({ label: 'Kitchen', floor: 'Ground Floor' });
      expect(result.id).toBe(1);
    });
  });

  describe('getRoom', () => {
    it('returns detail when found', async () => {
      const room = makeRoom();
      const repo = makeMockRepo({ findByIdWithRelations: jest.fn().mockResolvedValue(room) });
      const service = new RoomService(repo);
      const result = await service.getRoom(1);
      expect(result.id).toBe(1);
    });

    it('throws NOT_FOUND when room absent', async () => {
      const repo = makeMockRepo({ findByIdWithRelations: jest.fn().mockResolvedValue(null) });
      const service = new RoomService(repo);
      await expect(service.getRoom(99)).rejects.toThrow(AppError);
      await expect(service.getRoom(99)).rejects.toMatchObject({ code: ErrorCodes.NOT_FOUND });
    });
  });

  describe('updateRoom', () => {
    it('updates and returns room', async () => {
      const room = makeRoom({ label: 'Lounge' });
      const repo = makeMockRepo({
        findById: jest.fn().mockResolvedValue(makeRoom()),
        save: jest.fn().mockResolvedValue(room),
      });
      const service = new RoomService(repo);
      const result = await service.updateRoom(1, { label: 'Lounge' });
      expect(result.label).toBe('Lounge');
    });

    it('throws NOT_FOUND when room absent', async () => {
      const repo = makeMockRepo({ findById: jest.fn().mockResolvedValue(null) });
      const service = new RoomService(repo);
      await expect(service.updateRoom(99, { label: 'X' })).rejects.toMatchObject({
        code: ErrorCodes.NOT_FOUND,
      });
    });
  });

  describe('deleteRoom', () => {
    it('deletes room when found', async () => {
      const repo = makeMockRepo({ findById: jest.fn().mockResolvedValue(makeRoom()) });
      const service = new RoomService(repo);
      await expect(service.deleteRoom(1)).resolves.toBeUndefined();
    });

    it('throws NOT_FOUND when room absent', async () => {
      const repo = makeMockRepo({ findById: jest.fn().mockResolvedValue(null) });
      const service = new RoomService(repo);
      await expect(service.deleteRoom(99)).rejects.toMatchObject({ code: ErrorCodes.NOT_FOUND });
    });
  });
});
