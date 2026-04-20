import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type JsonResponseBody = Record<string, unknown>;

const mockFetch = vi.fn();

const toJsonResponse = (body: JsonResponseBody, ok = true): Response => ({
  ok,
  status: ok ? 200 : 500,
  json: async () => body,
} as Response);

const makeStatsResponse = (slug: string, total: number) => ({
  ok: true,
  data: {
    type: 'category',
    slug,
    total,
    avgLegitimacyScore: 82,
    trafficDistribution: {
      top10k: 1,
      top100k: 3,
      top1m: Math.max(0, total - 4),
      unranked: 0,
    },
    topTechnologies: [{ name: 'react', count: Math.min(total, 8) }],
    topTags: [{ name: slug, count: total }],
    topCountries: [{ country: 'US', count: Math.min(total, 5) }],
    hasTrafficData: Math.min(total, 5),
  },
});

const makeSiteReportResponse = (domain: string) => ({
  ok: true,
  data: {
    domain,
    freshness: {
      is_stale: false,
      updated_at: '2026-02-03T00:00:00Z',
    },
    report: {
      domain,
      updatedAt: '2026-02-03T00:00:00Z',
      meta: {
        title: `${domain} title`,
        description: `${domain} description`,
        techStackDetected: ['React', 'Next.js'],
      },
      seo: {
        h1Count: 1,
        h2Count: 4,
        internalLinks: 20,
        externalLinks: 5,
        imagesCount: 6,
      },
      files: {
        hasRobots: true,
        hasSitemap: true,
        robotsSitemapUrls: [`https://${domain}/sitemap.xml`],
      },
      dns: {
        provider: 'Cloudflare',
        nsRecords: ['ns1.example.com'],
      },
      trafficData: {
        monthlyVisits: 120000,
        globalRank: 2500,
        bounceRate: 41,
        avgVisitDuration: 180,
        pagesPerVisit: 3.2,
        topCountry: 'US',
        domainAgeYears: 5.5,
      },
      taxonomy: {
        iabCategory: 'Technology & Computing',
        tags: ['AI/ML'],
      },
      aiAnalysis: {
        business: {
          summary: 'B2B software platform',
        },
        risk: {
          score: 84,
          isSpam: false,
        },
      },
      visual: {
        screenshotUrl: `https://cdn.sitejson.com/${domain}.jpg`,
      },
    },
  },
});

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

  it('builds a filtered sitemap with gated directory, domain, and alternatives URLs', async () => {
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
        return toJsonResponse({
          ok: true,
          data: {
            items: [{ domain: 'Blog.SiteJson.COM', updated_at: '2026-02-02T00:00:00Z' }],
          },
        });
      }

      if (target.includes('/api/v1/directory/topic/finance?page=1&page_size=500')) {
        return toJsonResponse({
          ok: true,
          data: {
            items: [{ domain: 'finance.example', updated_at: '2026-02-02T00:00:00Z' }],
          },
        });
      }

      if (target.includes('/api/v1/directory/category/technology/stats')) {
        return toJsonResponse(makeStatsResponse('technology', 80));
      }

      if (target.includes('/api/v1/directory/category/marketing/stats')) {
        return toJsonResponse(makeStatsResponse('marketing', 12));
      }

      if (target.includes('/api/v1/directory/technology/react/stats')) {
        return toJsonResponse(makeStatsResponse('react', 55));
      }

      if (target.includes('/api/v1/directory/topic/finance/stats')) {
        return toJsonResponse(makeStatsResponse('finance', 30));
      }

      if (target.includes('/api/v1/sites/example.com/alternatives')) {
        return toJsonResponse({
          ok: true,
          data: {
            algorithm: 'v1',
            items: [{ domain: 'alt1.com' }, { domain: 'alt2.com' }, { domain: 'alt3.com' }],
          },
        });
      }

      if (target.includes('/api/v1/sites/blog.sitejson.com/alternatives')) {
        return toJsonResponse({
          ok: true,
          data: {
            algorithm: 'v1',
            items: [{ domain: 'alt1.com' }, { domain: 'alt2.com' }],
          },
        });
      }

      if (target.includes('/api/v1/sites/finance.example/alternatives')) {
        return toJsonResponse({
          ok: true,
          data: {
            algorithm: 'v1',
            items: [],
          },
        });
      }

      if (target.includes('/api/v1/sites/example.com')) {
        return toJsonResponse(makeSiteReportResponse('example.com'));
      }

      if (target.includes('/api/v1/sites/blog.sitejson.com')) {
        return toJsonResponse(makeSiteReportResponse('blog.sitejson.com'));
      }

      if (target.includes('/api/v1/sites/finance.example')) {
        return toJsonResponse(makeSiteReportResponse('finance.example'));
      }

      if (target.includes('/api/v1/sites/openai.com')) {
        return toJsonResponse(makeSiteReportResponse('openai.com'));
      }

      if (target.includes('/api/v1/sites/stripe.com')) {
        return toJsonResponse(makeSiteReportResponse('stripe.com'));
      }

      if (target.includes('/api/v1/sites/figma.com')) {
        return toJsonResponse(makeSiteReportResponse('figma.com'));
      }

      if (target.includes('/api/v1/sites/vercel.com')) {
        return toJsonResponse(makeSiteReportResponse('vercel.com'));
      }

      return toJsonResponse({}, false);
    });

    const sitemap = await importSitemap();
    const entries = await sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(urls).toContain('https://sitejson.com');
    expect(urls).toContain('https://sitejson.com/insights');
    expect(urls).toContain('https://sitejson.com/rss.xml');
    expect(urls).toContain('https://sitejson.com/directory/category/technology');
    expect(urls).toContain('https://sitejson.com/directory/category/technology/page/2');
    expect(urls).toContain('https://sitejson.com/directory/technology/react/page/2');
    expect(urls).toContain('https://sitejson.com/data/example.com');
    expect(urls).toContain('https://sitejson.com/data/example.com/traffic');
    expect(urls).toContain('https://sitejson.com/data/example.com/alternatives');
    expect(urls).not.toContain('https://sitejson.com/data/blog.sitejson.com/alternatives');
    expect(urls.some((url) => url.includes('/compare/'))).toBe(false);
  });

  it('keeps curated fallback URLs when upstream APIs fail completely', async () => {
    process.env.PUBLIC_SITE_BASE_URL = 'https://sitejson.com';
    process.env.SITEJSON_API_BASE_URL = 'https://api.sitejson.com';
    mockFetch.mockRejectedValue(new Error('network failure'));

    const sitemap = await importSitemap();
    const entries = await sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(urls).toEqual(expect.arrayContaining([
      'https://sitejson.com',
      'https://sitejson.com/directory',
      'https://sitejson.com/directory/category',
      'https://sitejson.com/directory/technology',
      'https://sitejson.com/directory/topic',
      'https://sitejson.com/insights',
      'https://sitejson.com/rss.xml',
      'https://sitejson.com/directory/category/technology',
      'https://sitejson.com/directory/technology/react',
      'https://sitejson.com/directory/topic/finance',
      'https://sitejson.com/data/openai.com',
      'https://sitejson.com/data/openai.com/traffic',
      'https://sitejson.com/data/openai.com/seo',
      'https://sitejson.com/data/openai.com/tech',
      'https://sitejson.com/data/openai.com/business',
      'https://sitejson.com/data/openai.com/alternatives',
    ]));
    expect(urls.some((url) => url.includes('/compare/'))).toBe(false);
  });
});
