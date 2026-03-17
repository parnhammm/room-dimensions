import { DimensionSegmentService } from '../../src/services/DimensionSegmentService';
import { IDimensionSegmentRepository } from '../../src/repositories/IDimensionSegmentRepository';
import { IRoomRepository } from '../../src/repositories/IRoomRepository';
import { DimensionSegment } from '../../src/entities/DimensionSegment';
import { Room } from '../../src/entities/Room';
import { ErrorCodes } from '../../src/errors/ErrorCodes';

function mockSegmentRepo(overrides: Partial<IDimensionSegmentRepository> = {}): IDimensionSegmentRepository {
  return {
    findByRoomAndSurface: jest.fn().mockResolvedValue([]),
    findById: jest.fn().mockResolvedValue(null),
    save: jest.fn(),
    delete: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

function mockRoomRepo(overrides: Partial<IRoomRepository> = {}): IRoomRepository {
  return {
    findAll: jest.fn().mockResolvedValue([]),
    findById: jest.fn().mockResolvedValue({ id: 1 } as Room),
    findByIdWithRelations: jest.fn().mockResolvedValue(null),
    findAllWithRelations: jest.fn().mockResolvedValue([]),
    save: jest.fn(),
    delete: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

// eslint-disable-next-line max-lines-per-function
describe('DimensionSegmentService', () => {
  describe('getSegments', () => {
    it('returns floor and ceiling segments independently', async () => {
      const floorSeg = { id: 1, surfaceType: 'floor', createdAt: new Date() } as DimensionSegment;
      const segRepo = mockSegmentRepo({ findByRoomAndSurface: jest.fn().mockResolvedValue([floorSeg]) });
      const service = new DimensionSegmentService(segRepo, mockRoomRepo());
      const result = await service.getSegments(1, 'floor');
      expect(result).toHaveLength(1);
      expect(segRepo.findByRoomAndSurface).toHaveBeenCalledWith(1, 'floor');
    });
  });

  describe('addSegment', () => {
    it('throws NOT_FOUND when room does not exist', async () => {
      const roomRepo = mockRoomRepo({ findById: jest.fn().mockResolvedValue(null) });
      const service = new DimensionSegmentService(mockSegmentRepo(), roomRepo);
      await expect(
        service.addSegment(99, { label: 'X', measurement: 1, surfaceType: 'floor' }),
      ).rejects.toMatchObject({ code: ErrorCodes.NOT_FOUND });
    });

    it('saves segment when room exists', async () => {
      const saved = { id: 1, label: 'N', measurement: 5, surfaceType: 'floor', createdAt: new Date() } as DimensionSegment;
      const segRepo = mockSegmentRepo({ save: jest.fn().mockResolvedValue(saved) });
      const service = new DimensionSegmentService(segRepo, mockRoomRepo());
      const result = await service.addSegment(1, { label: 'N', measurement: 5, surfaceType: 'floor' });
      expect(result.id).toBe(1);
    });
  });

  describe('updateSegment', () => {
    it('throws NOT_FOUND when segment absent', async () => {
      const service = new DimensionSegmentService(mockSegmentRepo(), mockRoomRepo());
      await expect(service.updateSegment(1, 99, { label: 'X' })).rejects.toMatchObject({
        code: ErrorCodes.NOT_FOUND,
      });
    });
  });

  describe('deleteSegment', () => {
    it('throws NOT_FOUND when segment absent', async () => {
      const service = new DimensionSegmentService(mockSegmentRepo(), mockRoomRepo());
      await expect(service.deleteSegment(1, 99)).rejects.toMatchObject({ code: ErrorCodes.NOT_FOUND });
    });
  });
});
