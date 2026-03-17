import { RoomService } from '../../src/services/RoomService';
import { IRoomRepository } from '../../src/repositories/IRoomRepository';
import { IAppSettingsRepository } from '../../src/repositories/IAppSettingsRepository';
import { Room } from '../../src/entities/Room';
import { Wall } from '../../src/entities/Wall';
import { Window } from '../../src/entities/Window';
import { DimensionSegment } from '../../src/entities/DimensionSegment';
import { SurfaceDimension } from '../../src/entities/SurfaceDimension';
import { AppSettings } from '../../src/entities/AppSettings';
import { ErrorCodes } from '../../src/errors/ErrorCodes';
import { AppError } from '../../src/errors/AppError';

function makeSegment(overrides: Partial<DimensionSegment> = {}): DimensionSegment {
  return {
    id: 1,
    label: 'Seg A',
    measurement: 5,
    width: null,
    length: null,
    surfaceType: 'floor',
    createdAt: new Date('2026-01-01'),
    ...overrides,
  } as DimensionSegment;
}

function makeSurfaceDimension(overrides: Partial<SurfaceDimension> = {}): SurfaceDimension {
  return {
    id: 1,
    surfaceType: 'floor',
    width: 4,
    length: 3,
    roomId: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  } as SurfaceDimension;
}

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

function makeWindow(overrides: Partial<Window> = {}): Window {
  return {
    id: 1,
    label: 'Window A',
    width: 1.2,
    height: 0.9,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  } as Window;
}

function makeWall(overrides: Partial<Wall> = {}): Wall {
  return {
    id: 1,
    label: 'North Wall',
    width: 4,
    height: 2.5,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    windows: [],
    ...overrides,
  } as Wall;
}

function makeMockSettingsRepo(unit = 'm'): IAppSettingsRepository {
  return {
    findSingleton: jest.fn().mockResolvedValue({ measurementUnit: unit } as AppSettings),
    upsert: jest.fn(),
  };
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

// eslint-disable-next-line max-lines-per-function
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

  describe('getRoom with dimension segments and surface dimensions', () => {
    it('maps floor and ceiling segments including width and length', async () => {
      const room = makeRoom({
        dimensionSegments: [
          makeSegment({ surfaceType: 'floor', width: 2.5, length: 3.0 }),
          makeSegment({ id: 2, surfaceType: 'ceiling', label: 'Seg B' }),
        ],
      });
      const repo = makeMockRepo({ findByIdWithRelations: jest.fn().mockResolvedValue(room) });
      const service = new RoomService(repo);
      const result = await service.getRoom(1);
      expect(result.floorSegments).toHaveLength(1);
      expect(result.floorSegments[0].width).toBe(2.5);
      expect(result.floorSegments[0].length).toBe(3.0);
      expect(result.ceilingSegments).toHaveLength(1);
      expect(result.ceilingSegments[0].width).toBeNull();
    });

    it('maps floorDimension and ceilingDimension when surface dimensions present', async () => {
      const room = makeRoom({
        surfaceDimensions: [
          makeSurfaceDimension({ surfaceType: 'floor', width: 4, length: 3 }),
          makeSurfaceDimension({ id: 2, surfaceType: 'ceiling', width: 3.5, length: 2.5 }),
        ],
      });
      const repo = makeMockRepo({ findByIdWithRelations: jest.fn().mockResolvedValue(room) });
      const service = new RoomService(repo);
      const result = await service.getRoom(1);
      expect(result.floorDimension).not.toBeNull();
      expect(result.floorDimension!.width).toBe(4);
      expect(result.ceilingDimension).not.toBeNull();
      expect(result.ceilingDimension!.width).toBe(3.5);
    });
  });

  // eslint-disable-next-line max-lines-per-function
  describe('printSummary', () => {
    it('returns unit from settings repo and groups rooms by floor', async () => {
      const rooms = [
        makeRoom({ id: 1, floor: 'Ground Floor', dimensionSegments: [], walls: [], surfaceDimensions: [] }),
        makeRoom({ id: 2, label: 'Bedroom', floor: 'First Floor', dimensionSegments: [], walls: [], surfaceDimensions: [] }),
      ];
      const repo = makeMockRepo({ findAllWithRelations: jest.fn().mockResolvedValue(rooms) });
      const settingsRepo = makeMockSettingsRepo('ft');
      const service = new RoomService(repo, settingsRepo);
      const result = await service.printSummary();
      expect(result.unit).toBe('ft');
      expect(result.floors).toHaveLength(2);
      expect(result.floors[0].floor).toBe('First Floor');
    });

    it('defaults unit to m when no settings repo provided', async () => {
      const repo = makeMockRepo({ findAllWithRelations: jest.fn().mockResolvedValue([]) });
      const service = new RoomService(repo);
      const result = await service.printSummary();
      expect(result.unit).toBe('m');
    });

    it('maps segments, walls with windows, and surface dimensions in printSummary', async () => {
      const wall = makeWall({ windows: [makeWindow()] });
      const room = makeRoom({
        dimensionSegments: [
          makeSegment({ surfaceType: 'floor', width: 2.0, length: 3.0 }),
          makeSegment({ id: 2, surfaceType: 'ceiling', label: 'Ceil Seg' }),
        ],
        walls: [wall],
        surfaceDimensions: [
          makeSurfaceDimension({ surfaceType: 'floor' }),
          makeSurfaceDimension({ id: 2, surfaceType: 'ceiling', width: 3, length: 2 }),
        ],
      });
      const repo = makeMockRepo({ findAllWithRelations: jest.fn().mockResolvedValue([room]) });
      const service = new RoomService(repo, makeMockSettingsRepo('cm'));
      const result = await service.printSummary();
      const roomResult = result.floors[0].rooms[0];
      expect(roomResult.floorSegments).toHaveLength(1);
      expect(roomResult.ceilingSegments).toHaveLength(1);
      expect(roomResult.walls[0].windows).toHaveLength(1);
      expect(roomResult.floorDimension).not.toBeNull();
      expect(roomResult.ceilingDimension).not.toBeNull();
    });
  });
});
