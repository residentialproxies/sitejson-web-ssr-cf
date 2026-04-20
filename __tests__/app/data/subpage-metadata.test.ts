import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getSiteReportResult } from '@/lib/api-client/client';
import { generateMetadata as generateTrafficMetadata } from '@/app/data/[domain]/traffic/page';
import { generateMetadata as generateSeoMetadata } from '@/app/data/[domain]/seo/page';
import { generateMetadata as generateTechMetadata } from '@/app/data/[domain]/tech/page';
import { generateMetadata as generateBusinessMetadata } from '@/app/data/[domain]/business/page';

vi.mock('@/lib/api-client/client', () => ({
  getSiteReport: vi.fn(),
  getSiteReportResult: vi.fn(),
}));

const richReport = {
  domain: 'example.com',
  meta: { title: 'Example', description: 'Desc', techStackDetected: ['Next.js'] },
  seo: { h1Count: 1, h2Count: 2, internalLinks: 12, externalLinks: 4, imagesCount: 6 },
  files: { hasRobots: true, hasSitemap: true, robotsSitemapUrls: ['https://example.com/sitemap.xml'] },
  dns: { provider: 'Cloudflare', nsRecords: ['ns1.example.com'] },
  trafficData: {
    monthlyVisits: 100000,
    globalRank: 2000,
    bounceRate: 45,
    avgVisitDuration: 120,
    pagesPerVisit: 2.5,
    topCountry: 'US',
  },
  taxonomy: { iabCategory: 'Technology & Computing', tags: ['AI/ML'] },
  aiAnalysis: {
    business: { summary: 'B2B SaaS' },
    risk: { score: 80, isSpam: false },
  },
};

describe('data subpage metadata gates', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('keeps rich traffic subpages indexable', async () => {
    vi.mocked(getSiteReportResult).mockResolvedValueOnce({
      status: 'success',
      data: { report: richReport, updatedAt: '2026-03-01T00:00:00Z', isStale: false },
    });

    const metadata = await generateTrafficMetadata({ params: Promise.resolve({ domain: 'example.com' }) });

    expect(metadata.robots).toEqual({ index: true, follow: true });
  });

  it('noindexes sparse SEO subpages', async () => {
    vi.mocked(getSiteReportResult).mockResolvedValueOnce({
      status: 'success',
      data: {
        report: {
          domain: 'example.com',
          meta: { title: '', description: '' },
          seo: { h1Count: 0, h2Count: 0, internalLinks: 0, externalLinks: 0, imagesCount: 0 },
          files: { hasRobots: false, hasSitemap: false, robotsSitemapUrls: [] },
        },
        updatedAt: '2026-03-01T00:00:00Z',
        isStale: false,
      },
    });

    const metadata = await generateSeoMetadata({ params: Promise.resolve({ domain: 'example.com' }) });

    expect(metadata.robots).toEqual({ index: false, follow: true });
  });

  it('noindexes sparse tech subpages', async () => {
    vi.mocked(getSiteReportResult).mockResolvedValueOnce({
      status: 'success',
      data: {
        report: {
          domain: 'example.com',
          meta: { title: 'Example', description: 'Desc', techStackDetected: [] },
          dns: { provider: '', nsRecords: [], mxRecords: [], txtRecords: [] },
        },
        updatedAt: '2026-03-01T00:00:00Z',
        isStale: false,
      },
    });

    const metadata = await generateTechMetadata({ params: Promise.resolve({ domain: 'example.com' }) });

    expect(metadata.robots).toEqual({ index: false, follow: true });
  });

  it('keeps rich business subpages indexable', async () => {
    vi.mocked(getSiteReportResult).mockResolvedValueOnce({
      status: 'success',
      data: { report: richReport, updatedAt: '2026-03-01T00:00:00Z', isStale: false },
    });

    const metadata = await generateBusinessMetadata({ params: Promise.resolve({ domain: 'example.com' }) });

    expect(metadata.robots).toEqual({ index: true, follow: true });
  });
});
