import { windowsService } from '../windowsService';
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

describe('windowsService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('getWindows calls GET /api/v1/rooms/:roomId/walls/:wallId/windows', async () => {
    mockGet.mockResolvedValue([]);
    await windowsService.getWindows(1, 2);
    expect(mockGet).toHaveBeenCalledWith('/api/v1/rooms/1/walls/2/windows');
  });

  it('addWindow calls POST with dto', async () => {
    mockPost.mockResolvedValue({ id: 3 });
    await windowsService.addWindow(1, 2, { label: 'Bay window', width: 1.2, height: 0.9 });
    expect(mockPost).toHaveBeenCalledWith(
      '/api/v1/rooms/1/walls/2/windows',
      { label: 'Bay window', width: 1.2, height: 0.9 },
    );
  });

  it('updateWindow calls PATCH with partial dto', async () => {
    mockPatch.mockResolvedValue({ id: 3 });
    await windowsService.updateWindow(1, 2, 3, { height: 1.0 });
    expect(mockPatch).toHaveBeenCalledWith('/api/v1/rooms/1/walls/2/windows/3', { height: 1.0 });
  });

  it('deleteWindow calls DELETE on correct path', async () => {
    mockDelete.mockResolvedValue(undefined);
    await windowsService.deleteWindow(1, 2, 3);
    expect(mockDelete).toHaveBeenCalledWith('/api/v1/rooms/1/walls/2/windows/3');
  });

  it('propagates errors from apiClient', async () => {
    mockPost.mockRejectedValue(new Error('server error'));
    await expect(
      windowsService.addWindow(1, 2, { label: 'X', width: 1, height: 1 }),
    ).rejects.toThrow('server error');
  });
});
