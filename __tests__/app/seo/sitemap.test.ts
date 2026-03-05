import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type JsonResponseBody = Record<string, unknown>;

const mockFetch = vi.fn();

const toJsonResponse = (body: JsonResponseBody, ok = true): Response => ({
  ok,
  status: ok ? 200 : 500,
  json: async () => body,
} as Response);

const importSitemap = async () => {
  vi.resetModules();
  const module = await import('@/app/sitemap');
  return module.default;
};

describe('sitemap route', () => {
  const originalBase = process.env.PUBLIC_SITE_BASE_URL;
  const originalApiBase = process.env.SITEJSON_API_BASE_URL;
  const originalApiKey = process.env.SITEJSON_API_KEY;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    if (originalBase == null) delete process.env.PUBLIC_SITE_BASE_URL;
    else process.env.PUBLIC_SITE_BASE_URL = originalBase;

    if (originalApiBase == null) delete process.env.SITEJSON_API_BASE_URL;
    else process.env.SITEJSON_API_BASE_URL = originalApiBase;

    if (originalApiKey == null) delete process.env.SITEJSON_API_KEY;
    else process.env.SITEJSON_API_KEY = originalApiKey;

    vi.unstubAllGlobals();
  });

  it('builds sitemap with normalized and deduplicated domain/directory URLs', async () => {
    process.env.PUBLIC_SITE_BASE_URL = 'https://sitejson.com/';
    process.env.SITEJSON_API_BASE_URL = 'https://api.sitejson.com';
    process.env.SITEJSON_API_KEY = 'test-key';

    mockFetch.mockImplementation(async (url: string | URL) => {
      const target = url.toString();
      if (target.includes('/api/v1/directory/category/technology')) {
        return toJsonResponse({
          ok: true,
          data: {
            items: [
              { domain: ' Example.COM ' },
              { domain: 'https://example.com/path' },
            ],
          },
        });
      }

      if (target.includes('/api/v1/directory/technology/react')) {
        return toJsonResponse({
          ok: true,
          data: {
            items: [{ domain: 'Blog.SiteJson.COM' }],
          },
        });
      }

      if (target.includes('/api/v1/directory/topic/finance')) {
        return toJsonResponse({
          ok: true,
          data: {
            items: [{ domain: 'example.com' }],
          },
        });
      }

      return toJsonResponse({}, false);
    });

    const sitemap = await importSitemap();
    const entries = await sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(mockFetch).toHaveBeenCalledTimes(3);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.sitejson.com/api/v1/directory/category/technology?page=1&page_size=500',
      expect.objectContaining({
        headers: expect.objectContaining({
          accept: 'application/json',
          'x-api-key': 'test-key',
        }),
      })
    );
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.sitejson.com/api/v1/directory/technology/react?page=1&page_size=500',
      expect.any(Object)
    );
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.sitejson.com/api/v1/directory/topic/finance?page=1&page_size=500',
      expect.any(Object)
    );

    expect(urls).toContain('https://sitejson.com');
    expect(urls).toContain('https://sitejson.com/rss.xml');
    expect(urls).toContain('https://sitejson.com/directory');
    expect(urls).toContain('https://sitejson.com/data/example.com');
    expect(urls).toContain('https://sitejson.com/data/blog.sitejson.com');
    expect(urls).toContain('https://sitejson.com/directory/category/technology');
    expect(urls).toContain('https://sitejson.com/directory/technology/react');
    expect(urls).toContain('https://sitejson.com/directory/topic/finance');
    expect(urls.filter((url) => url === 'https://sitejson.com/data/example.com')).toHaveLength(1);
    expect(urls.filter((url) => url === 'https://sitejson.com/directory/category/technology')).toHaveLength(1);
  });

  it('returns static pages when upstream APIs fail', async () => {
    process.env.PUBLIC_SITE_BASE_URL = 'https://sitejson.com';
    mockFetch.mockRejectedValue(new Error('network failure'));

    const sitemap = await importSitemap();
    const entries = await sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(urls).toEqual([
      'https://sitejson.com',
      'https://sitejson.com/directory',
      'https://sitejson.com/directory/category',
      'https://sitejson.com/directory/technology',
      'https://sitejson.com/directory/topic',
      'https://sitejson.com/rss.xml',
    ]);
  });
});
