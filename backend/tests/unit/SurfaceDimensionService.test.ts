import { SurfaceDimensionService } from '../../src/services/SurfaceDimensionService';
import { ISurfaceDimensionRepository } from '../../src/repositories/ISurfaceDimensionRepository';
import { IRoomRepository } from '../../src/repositories/IRoomRepository';
import { SurfaceDimension } from '../../src/entities/SurfaceDimension';
import { Room } from '../../src/entities/Room';
import { ErrorCodes } from '../../src/errors/ErrorCodes';

const mockSdRepo = (o: Partial<ISurfaceDimensionRepository> = {}): ISurfaceDimensionRepository => ({
  findByRoomAndSurface: jest.fn().mockResolvedValue(null),
  upsert: jest.fn(),
  delete: jest.fn().mockResolvedValue(undefined),
  ...o,
});

const mockRoomRepo = (o: Partial<IRoomRepository> = {}): IRoomRepository => ({
  findAll: jest.fn().mockResolvedValue([]),
  findById: jest.fn().mockResolvedValue({ id: 1 } as Room),
  findByIdWithRelations: jest.fn().mockResolvedValue(null),
  findAllWithRelations: jest.fn().mockResolvedValue([]),
  save: jest.fn(),
  delete: jest.fn().mockResolvedValue(undefined),
  ...o,
});

const sd = (): SurfaceDimension =>
  ({
    id: 1,
    surfaceType: 'floor',
    width: 5,
    length: 4.2,
    roomId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  }) as SurfaceDimension;

// eslint-disable-next-line max-lines-per-function
describe('SurfaceDimensionService', () => {
  describe('getForRoom', () => {
    it('returns dimension when present', async () => {
      const svc = new SurfaceDimensionService(
        mockSdRepo({ findByRoomAndSurface: jest.fn().mockResolvedValue(sd()) }),
        mockRoomRepo(),
      );
      const result = await svc.getForRoom(1, 'floor');
      expect(result.id).toBe(1);
      expect(result.surfaceType).toBe('floor');
    });

    it('throws NOT_FOUND when dimension absent', async () => {
      const svc = new SurfaceDimensionService(mockSdRepo(), mockRoomRepo());
      await expect(svc.getForRoom(1, 'floor')).rejects.toMatchObject({ code: ErrorCodes.NOT_FOUND });
    });

    it('throws NOT_FOUND when room absent', async () => {
      const svc = new SurfaceDimensionService(
        mockSdRepo(),
        mockRoomRepo({ findById: jest.fn().mockResolvedValue(null) }),
      );
      await expect(svc.getForRoom(99, 'floor')).rejects.toMatchObject({ code: ErrorCodes.NOT_FOUND });
    });
  });

  describe('upsert', () => {
    it('creates new record', async () => {
      const saved = sd();
      const sdRepo = mockSdRepo({ upsert: jest.fn().mockResolvedValue(saved) });
      const svc = new SurfaceDimensionService(sdRepo, mockRoomRepo());
      const result = await svc.upsert(1, 'floor', { width: 5, length: 4.2 });
      expect(sdRepo.upsert).toHaveBeenCalledWith(1, 'floor', { width: 5, length: 4.2 });
      expect(result.id).toBe(1);
    });

    it('updates existing record', async () => {
      const updated = { ...sd(), width: 6, length: 5 } as SurfaceDimension;
      const sdRepo = mockSdRepo({ upsert: jest.fn().mockResolvedValue(updated) });
      const svc = new SurfaceDimensionService(sdRepo, mockRoomRepo());
      const result = await svc.upsert(1, 'floor', { width: 6, length: 5 });
      expect(result.width).toBe(6);
    });

    it('throws NOT_FOUND when room absent', async () => {
      const svc = new SurfaceDimensionService(
        mockSdRepo(),
        mockRoomRepo({ findById: jest.fn().mockResolvedValue(null) }),
      );
      await expect(svc.upsert(99, 'floor', { width: 5, length: 4 })).rejects.toMatchObject({
        code: ErrorCodes.NOT_FOUND,
      });
    });
  });

  describe('delete', () => {
    it('removes record', async () => {
      const sdRepo = mockSdRepo({ findByRoomAndSurface: jest.fn().mockResolvedValue(sd()) });
      const svc = new SurfaceDimensionService(sdRepo, mockRoomRepo());
      await svc.delete(1, 'floor');
      expect(sdRepo.delete).toHaveBeenCalledWith(1, 'floor');
    });

    it('throws NOT_FOUND when dimension absent', async () => {
      const svc = new SurfaceDimensionService(mockSdRepo(), mockRoomRepo());
      await expect(svc.delete(1, 'floor')).rejects.toMatchObject({ code: ErrorCodes.NOT_FOUND });
    });

    it('throws NOT_FOUND when room absent', async () => {
      const svc = new SurfaceDimensionService(
        mockSdRepo(),
        mockRoomRepo({ findById: jest.fn().mockResolvedValue(null) }),
      );
      await expect(svc.delete(99, 'floor')).rejects.toMatchObject({ code: ErrorCodes.NOT_FOUND });
    });
  });
});
