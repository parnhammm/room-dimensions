import { segmentsService } from '../segmentsService';
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

describe('segmentsService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('getSegments calls GET with surface query param', async () => {
    mockGet.mockResolvedValue([]);
    await segmentsService.getSegments(1, 'floor');
    expect(mockGet).toHaveBeenCalledWith('/api/v1/rooms/1/segments?surface=floor');
  });

  it('addSegment calls POST with full dto including width and length', async () => {
    mockPost.mockResolvedValue({ id: 1 });
    await segmentsService.addSegment(1, { label: 'A', measurement: 5, surfaceType: 'floor', width: 3.0, length: 2.5 });
    expect(mockPost).toHaveBeenCalledWith(
      '/api/v1/rooms/1/segments',
      { label: 'A', measurement: 5, surfaceType: 'floor', width: 3.0, length: 2.5 },
    );
  });

  it('addSegment forwards dto without width/length when omitted', async () => {
    mockPost.mockResolvedValue({ id: 2 });
    await segmentsService.addSegment(1, { label: 'B', measurement: 2, surfaceType: 'ceiling' });
    expect(mockPost).toHaveBeenCalledWith(
      '/api/v1/rooms/1/segments',
      { label: 'B', measurement: 2, surfaceType: 'ceiling' },
    );
  });

  it('updateSegment calls PATCH with only width', async () => {
    mockPatch.mockResolvedValue({ id: 1 });
    await segmentsService.updateSegment(1, 5, { width: 3.2 });
    expect(mockPatch).toHaveBeenCalledWith('/api/v1/rooms/1/segments/5', { width: 3.2 });
  });

  it('deleteSegment calls DELETE on correct path', async () => {
    mockDelete.mockResolvedValue(undefined);
    await segmentsService.deleteSegment(1, 5);
    expect(mockDelete).toHaveBeenCalledWith('/api/v1/rooms/1/segments/5');
  });

  it('propagates errors', async () => {
    mockPost.mockRejectedValue(new Error('server error'));
    await expect(
      segmentsService.addSegment(1, { label: 'X', measurement: 1, surfaceType: 'floor' }),
    ).rejects.toThrow('server error');
  });
});
