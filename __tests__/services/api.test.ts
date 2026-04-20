import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchSiteData } from '@/services/api';

describe('services/api fetchSiteData', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    mockFetch.mockReset();
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('retries plain-text 502 site report responses and returns a useful message', async () => {
    mockFetch.mockImplementation(() =>
      Promise.resolve(
        new Response('error code: 502', {
          status: 502,
          headers: {
            'content-type': 'text/plain; charset=UTF-8',
          },
        }),
      ),
    );

    const result = await fetchSiteData('google.com');

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(result).toEqual({
      status: 'error',
      message: 'SiteJSON is temporarily unavailable (HTTP 502). Please try again in a moment.',
    });
  });
});
