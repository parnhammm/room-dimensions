import { surfaceDimensionApi } from '../surfaceDimensionApi';
import { apiClient } from '../apiClient';

vi.mock('../apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockGet = vi.mocked(apiClient.get);
const mockPut = vi.mocked(apiClient.put);
const mockDelete = vi.mocked(apiClient.delete);

describe('surfaceDimensionApi', () => {
  beforeEach(() => vi.clearAllMocks());

  it('getFloorDimension calls GET /floor-dimensions', async () => {
    mockGet.mockResolvedValue({ width: 5, length: 4 });
    await surfaceDimensionApi.getFloorDimension(1);
    expect(mockGet).toHaveBeenCalledWith('/api/v1/rooms/1/floor-dimensions');
  });

  it('upsertFloorDimension calls PUT with data', async () => {
    mockPut.mockResolvedValue({ width: 5, length: 4 });
    await surfaceDimensionApi.upsertFloorDimension(1, { width: 5, length: 4 });
    expect(mockPut).toHaveBeenCalledWith('/api/v1/rooms/1/floor-dimensions', { width: 5, length: 4 });
  });

  it('deleteFloorDimension calls DELETE', async () => {
    mockDelete.mockResolvedValue(undefined);
    await surfaceDimensionApi.deleteFloorDimension(1);
    expect(mockDelete).toHaveBeenCalledWith('/api/v1/rooms/1/floor-dimensions');
  });

  it('getCeilingDimension calls GET /ceiling-dimensions', async () => {
    mockGet.mockResolvedValue({ width: 4, length: 3 });
    await surfaceDimensionApi.getCeilingDimension(1);
    expect(mockGet).toHaveBeenCalledWith('/api/v1/rooms/1/ceiling-dimensions');
  });

  it('upsertCeilingDimension calls PUT with data', async () => {
    mockPut.mockResolvedValue({ width: 4, length: 3 });
    await surfaceDimensionApi.upsertCeilingDimension(1, { width: 4, length: 3 });
    expect(mockPut).toHaveBeenCalledWith('/api/v1/rooms/1/ceiling-dimensions', { width: 4, length: 3 });
  });

  it('deleteCeilingDimension calls DELETE', async () => {
    mockDelete.mockResolvedValue(undefined);
    await surfaceDimensionApi.deleteCeilingDimension(1);
    expect(mockDelete).toHaveBeenCalledWith('/api/v1/rooms/1/ceiling-dimensions');
  });

  it('propagates errors from apiClient', async () => {
    mockGet.mockRejectedValue(new Error('network error'));
    await expect(surfaceDimensionApi.getFloorDimension(99)).rejects.toThrow('network error');
  });
});
