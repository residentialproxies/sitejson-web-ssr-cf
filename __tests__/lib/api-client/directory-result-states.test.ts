import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getDirectoryListingResult } from '@/lib/api-client/client';

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('getDirectoryListingResult', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.SITEJSON_API_BASE_URL = 'http://localhost:8787';
    process.env.NEXT_PUBLIC_SITEJSON_API_BASE_URL = 'http://localhost:8787';
    process.env.SITEJSON_API_KEY = 'test-api-key';
  });

  afterEach(() => {
    delete process.env.SITEJSON_API_BASE_URL;
    delete process.env.NEXT_PUBLIC_SITEJSON_API_BASE_URL;
    delete process.env.SITEJSON_API_KEY;
  });

  it('returns empty when the upstream response is successful but has no items', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          ok: true,
          data: {
            items: [],
            pagination: { page: 1, page_size: 24, total: 0 },
          },
        }),
    });

    const result = await getDirectoryListingResult('topic', 'finance');

    expect(result).toEqual({
      status: 'empty',
      data: {
        items: [],
        page: 1,
        pageSize: 24,
        total: 0,
        totalPages: 0,
      },
    });
  });

  it('returns unavailable on upstream HTTP failure', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 503,
    });

    const result = await getDirectoryListingResult('topic', 'finance');

    expect(result.status).toBe('unavailable');
    expect(result.data).toEqual({
      items: [],
      page: 1,
      pageSize: 24,
      total: 0,
      totalPages: 0,
    });
  });

  it('returns timeout when fetch aborts', async () => {
    const abortError = new Error('Aborted');
    abortError.name = 'AbortError';
    mockFetch.mockRejectedValueOnce(abortError);

    const result = await getDirectoryListingResult('topic', 'finance');

    expect(result.status).toBe('timeout');
    expect(result.data).toEqual({
      items: [],
      page: 1,
      pageSize: 24,
      total: 0,
      totalPages: 0,
    });
  });
});
