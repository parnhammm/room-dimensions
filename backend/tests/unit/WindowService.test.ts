import { WindowService } from '../../src/services/WindowService';
import { IWindowRepository } from '../../src/repositories/IWindowRepository';
import { IWallRepository } from '../../src/repositories/IWallRepository';
import { Window as WinEntity } from '../../src/entities/Window';
import { Wall } from '../../src/entities/Wall';
import { ErrorCodes } from '../../src/errors/ErrorCodes';

const mockWinRepo = (o: Partial<IWindowRepository> = {}): IWindowRepository => ({
  findByWall: jest.fn().mockResolvedValue([]),
  findById: jest.fn().mockResolvedValue(null),
  save: jest.fn(),
  delete: jest.fn().mockResolvedValue(undefined),
  ...o,
});
const mockWallRepo = (o: Partial<IWallRepository> = {}): IWallRepository => ({
  findByRoom: jest.fn().mockResolvedValue([]),
  findById: jest.fn().mockResolvedValue({ id: 1 } as Wall),
  findByIdWithWindows: jest.fn().mockResolvedValue(null),
  save: jest.fn(),
  delete: jest.fn().mockResolvedValue(undefined),
  ...o,
});

describe('WindowService', () => {
  it('addWindow throws NOT_FOUND when wall absent', async () => {
    const svc = new WindowService(mockWinRepo(), mockWallRepo({ findById: jest.fn().mockResolvedValue(null) }));
    await expect(svc.addWindow(99, { label: 'X', width: 1, height: 1 })).rejects.toMatchObject({ code: ErrorCodes.NOT_FOUND });
  });

  it('updateWindow throws NOT_FOUND when absent', async () => {
    const svc = new WindowService(mockWinRepo(), mockWallRepo());
    await expect(svc.updateWindow(1, 99, { label: 'X' })).rejects.toMatchObject({ code: ErrorCodes.NOT_FOUND });
  });

  it('deleteWindow throws NOT_FOUND when absent', async () => {
    const svc = new WindowService(mockWinRepo(), mockWallRepo());
    await expect(svc.deleteWindow(1, 99)).rejects.toMatchObject({ code: ErrorCodes.NOT_FOUND });
  });
});
