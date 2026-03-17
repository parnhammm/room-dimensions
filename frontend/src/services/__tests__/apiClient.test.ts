import { apiClient } from '../apiClient';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function makeResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
    statusText: status === 204 ? 'No Content' : 'Error',
  } as Response;
}

// eslint-disable-next-line max-lines-per-function
describe('apiClient', () => {
  beforeEach(() => mockFetch.mockReset());

  it('GET returns parsed JSON on success', async () => {
    mockFetch.mockResolvedValue(makeResponse(200, { id: 1 }));
    const result = await apiClient.get('/api/v1/rooms');
    expect(result).toEqual({ id: 1 });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/rooms'),
      expect.objectContaining({ headers: expect.objectContaining({ 'Content-Type': 'application/json' }) }),
    );
  });

  it('returns undefined for 204 No Content', async () => {
    mockFetch.mockResolvedValue(makeResponse(204, null));
    const result = await apiClient.delete('/api/v1/rooms/1');
    expect(result).toBeUndefined();
  });

  it('throws ApiClientError with code and message on non-2xx', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: () => Promise.resolve({ error: { code: 'NOT_FOUND', message: 'Room not found' } }),
    } as Response);
    await expect(apiClient.get('/api/v1/rooms/99')).rejects.toMatchObject({
      code: 'NOT_FOUND',
      message: 'Room not found',
    });
  });

  it('falls back to UNKNOWN code when error body cannot be parsed', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: () => Promise.reject(new Error('parse error')),
    } as Response);
    await expect(apiClient.get('/fail')).rejects.toMatchObject({ code: 'UNKNOWN' });
  });

  it('POST sends JSON body', async () => {
    mockFetch.mockResolvedValue(makeResponse(201, { id: 2 }));
    await apiClient.post('/api/v1/rooms', { label: 'A', floor: '1' });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ label: 'A', floor: '1' }) }),
    );
  });

  it('PATCH sends JSON body', async () => {
    mockFetch.mockResolvedValue(makeResponse(200, { id: 2 }));
    await apiClient.patch('/api/v1/rooms/2', { label: 'B' });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ method: 'PATCH' }),
    );
  });
});
