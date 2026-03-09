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

  it('builds sitemap with summary-driven directories, insights, and normalized domains', async () => {
    process.env.PUBLIC_SITE_BASE_URL = 'https://sitejson.com/';
    process.env.SITEJSON_API_BASE_URL = 'https://api.sitejson.com';
    process.env.SITEJSON_API_KEY = 'test-key';

    mockFetch.mockImplementation(async (url: string | URL) => {
      const target = url.toString();
      if (target.includes('/api/v1/directory/category?limit=')) {
        return toJsonResponse({
          ok: true,
          data: {
            slugs: [
              { slug: 'technology', count: 80, topDomain: ' Example.COM ' },
              { slug: 'marketing', count: 12, topDomain: 'https://marketing.example/path' },
            ],
          },
        });
      }

      if (target.includes('/api/v1/directory/technology?limit=')) {
        return toJsonResponse({
          ok: true,
          data: {
            slugs: [
              { slug: 'react', count: 55, topDomain: 'Blog.SiteJson.COM' },
            ],
          },
        });
      }

      if (target.includes('/api/v1/directory/topic?limit=')) {
        return toJsonResponse({
          ok: true,
          data: {
            slugs: [
              { slug: 'finance', count: 30, topDomain: 'finance.example' },
            ],
          },
        });
      }

      if (target.includes('/api/v1/directory/category/technology?page=1&page_size=500')) {
        return toJsonResponse({
          ok: true,
          data: {
            items: [
              { domain: ' Example.COM ', updated_at: '2026-02-01T00:00:00Z' },
              { domain: 'https://example.com/path', updated_at: '2026-02-03T00:00:00Z' },
            ],
          },
        });
      }

      if (target.includes('/api/v1/directory/technology/react?page=1&page_size=500')) {
        return toJsonResponse({ ok: true, data: { items: [{ domain: 'Blog.SiteJson.COM' }] } });
      }

      if (target.includes('/api/v1/directory/topic/finance?page=1&page_size=500')) {
        return toJsonResponse({ ok: true, data: { items: [{ domain: 'finance.example' }] } });
      }

      return toJsonResponse({}, false);
    });

    const sitemap = await importSitemap();
    const entries = await sitemap();
    const urls = entries.map((entry) => entry.url);
    const exampleEntry = entries.find((entry) => entry.url === 'https://sitejson.com/data/example.com');

    expect(mockFetch).toHaveBeenCalledTimes(6);
    expect(urls).toContain('https://sitejson.com');
    expect(urls).toContain('https://sitejson.com/insights');
    expect(urls).toContain('https://sitejson.com/rss.xml');
    expect(urls).toContain('https://sitejson.com/directory/category/technology');
    expect(urls).toContain('https://sitejson.com/directory/category/marketing');
    expect(urls).toContain('https://sitejson.com/directory/technology/react');
    expect(urls).toContain('https://sitejson.com/directory/topic/finance');
    expect(urls).toContain('https://sitejson.com/directory/category/technology/page/2');
    expect(urls).toContain('https://sitejson.com/directory/technology/react/page/2');
    expect(urls).toContain('https://sitejson.com/data/example.com');
    expect(urls).toContain('https://sitejson.com/data/blog.sitejson.com');
    expect(urls).toContain('https://sitejson.com/data/finance.example');
    expect(urls.filter((url) => url === 'https://sitejson.com/data/example.com')).toHaveLength(1);
    expect(exampleEntry?.lastModified).toEqual(new Date('2026-02-03T00:00:00Z'));
    expect(urls.some((url) => url.includes('/compare/'))).toBe(false);
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
      'https://sitejson.com/insights',
      'https://sitejson.com/rss.xml',
    ]);
  });
});
