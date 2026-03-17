import { wallsService } from '../wallsService';
import { apiClient } from '../apiClient';

vi.mock('../apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockGet = vi.mocked(apiClient.get);
const mockPost = vi.mocked(apiClient.post);
const mockPatch = vi.mocked(apiClient.patch);
const mockDelete = vi.mocked(apiClient.delete);

describe('wallsService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('getWalls calls GET /api/v1/rooms/:roomId/walls', async () => {
    mockGet.mockResolvedValue([]);
    await wallsService.getWalls(1);
    expect(mockGet).toHaveBeenCalledWith('/api/v1/rooms/1/walls');
  });

  it('getWall calls GET /api/v1/rooms/:roomId/walls/:wallId', async () => {
    mockGet.mockResolvedValue({ id: 2 });
    await wallsService.getWall(1, 2);
    expect(mockGet).toHaveBeenCalledWith('/api/v1/rooms/1/walls/2');
  });

  it('addWall calls POST with dto', async () => {
    mockPost.mockResolvedValue({ id: 3 });
    await wallsService.addWall(1, { label: 'North', width: 4, height: 2.5 });
    expect(mockPost).toHaveBeenCalledWith('/api/v1/rooms/1/walls', { label: 'North', width: 4, height: 2.5 });
  });

  it('updateWall calls PATCH with partial dto', async () => {
    mockPatch.mockResolvedValue({ id: 2 });
    await wallsService.updateWall(1, 2, { width: 5 });
    expect(mockPatch).toHaveBeenCalledWith('/api/v1/rooms/1/walls/2', { width: 5 });
  });

  it('deleteWall calls DELETE on correct path', async () => {
    mockDelete.mockResolvedValue(undefined);
    await wallsService.deleteWall(1, 2);
    expect(mockDelete).toHaveBeenCalledWith('/api/v1/rooms/1/walls/2');
  });

  it('propagates errors from apiClient', async () => {
    mockGet.mockRejectedValue(new Error('network error'));
    await expect(wallsService.getWalls(99)).rejects.toThrow('network error');
  });
});
