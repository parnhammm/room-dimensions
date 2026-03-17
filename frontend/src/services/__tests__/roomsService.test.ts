import { roomsService } from '../roomsService';
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

describe('roomsService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('getRooms calls GET /api/v1/rooms', async () => {
    mockGet.mockResolvedValue([]);
    await roomsService.getRooms();
    expect(mockGet).toHaveBeenCalledWith('/api/v1/rooms');
  });

  it('getRoom calls GET with room id', async () => {
    mockGet.mockResolvedValue({ id: 1 });
    await roomsService.getRoom(1);
    expect(mockGet).toHaveBeenCalledWith('/api/v1/rooms/1');
  });

  it('getSummary calls GET summary endpoint', async () => {
    mockGet.mockResolvedValue({ floors: [] });
    await roomsService.getSummary();
    expect(mockGet).toHaveBeenCalledWith('/api/v1/rooms/summary');
  });

  it('createRoom calls POST with dto', async () => {
    mockPost.mockResolvedValue({ id: 1 });
    await roomsService.createRoom({ label: 'Kitchen', floor: 'Ground' });
    expect(mockPost).toHaveBeenCalledWith('/api/v1/rooms', { label: 'Kitchen', floor: 'Ground' });
  });

  it('updateRoom calls PATCH with dto', async () => {
    mockPatch.mockResolvedValue({ id: 1 });
    await roomsService.updateRoom(1, { label: 'Living Room' });
    expect(mockPatch).toHaveBeenCalledWith('/api/v1/rooms/1', { label: 'Living Room' });
  });

  it('deleteRoom calls DELETE', async () => {
    mockDelete.mockResolvedValue(undefined);
    await roomsService.deleteRoom(1);
    expect(mockDelete).toHaveBeenCalledWith('/api/v1/rooms/1');
  });

  it('propagates errors from apiClient', async () => {
    mockGet.mockRejectedValue(new Error('network error'));
    await expect(roomsService.getRooms()).rejects.toThrow('network error');
  });
});
