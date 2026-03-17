import { WallService } from '../../src/services/WallService';
import { IWallRepository } from '../../src/repositories/IWallRepository';
import { IRoomRepository } from '../../src/repositories/IRoomRepository';
import { Wall } from '../../src/entities/Wall';
import { Room } from '../../src/entities/Room';
import { ErrorCodes } from '../../src/errors/ErrorCodes';

const mockWallRepo = (o: Partial<IWallRepository> = {}): IWallRepository => ({
  findByRoom: jest.fn().mockResolvedValue([]),
  findById: jest.fn().mockResolvedValue(null),
  findByIdWithWindows: jest.fn().mockResolvedValue(null),
  save: jest.fn(),
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

const wall = (): Wall => ({ id: 1, label: 'N', width: 5, height: 2.4, roomId: 1, createdAt: new Date(), updatedAt: new Date(), windows: [] } as unknown as Wall);

describe('WallService', () => {
  it('getWalls orders by createdAt ASC', async () => {
    const wallRepo = mockWallRepo({ findByRoom: jest.fn().mockResolvedValue([wall()]) });
    const svc = new WallService(wallRepo, mockRoomRepo());
    const start = Date.now();
    const r = await svc.getWalls(1);
    expect(Date.now() - start).toBeLessThan(2000);
    expect(r).toHaveLength(1);
  });

  it('addWall throws NOT_FOUND when room absent', async () => {
    const svc = new WallService(mockWallRepo(), mockRoomRepo({ findById: jest.fn().mockResolvedValue(null) }));
    await expect(svc.addWall(99, { label: 'X', width: 1, height: 1 })).rejects.toMatchObject({ code: ErrorCodes.NOT_FOUND });
  });

  it('updateWall throws NOT_FOUND when absent', async () => {
    const svc = new WallService(mockWallRepo(), mockRoomRepo());
    await expect(svc.updateWall(1, 99, { label: 'X' })).rejects.toMatchObject({ code: ErrorCodes.NOT_FOUND });
  });

  it('deleteWall throws NOT_FOUND when absent', async () => {
    const svc = new WallService(mockWallRepo(), mockRoomRepo());
    await expect(svc.deleteWall(1, 99)).rejects.toMatchObject({ code: ErrorCodes.NOT_FOUND });
  });

  it('deleteWall cascades windows via TypeORM', async () => {
    const wallRepo = mockWallRepo({ findById: jest.fn().mockResolvedValue(wall()) });
    const svc = new WallService(wallRepo, mockRoomRepo());
    await svc.deleteWall(1, 1);
    expect(wallRepo.delete).toHaveBeenCalledWith(1);
  });
});
