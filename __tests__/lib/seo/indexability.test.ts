import { describe, expect, it } from 'vitest';
import type { DirectoryListingData, DirectoryStats, SiteReport } from '@/lib/api-client/types';
import {
  evaluateAlternativesIndexability,
  evaluateBusinessSubPageIndexability,
  evaluateDirectoryIndexability,
  evaluatePaginatedDirectoryIndexability,
  evaluateReportIndexability,
  evaluateSeoSubPageIndexability,
  evaluateTechSubPageIndexability,
  evaluateTrafficSubPageIndexability,
} from '@/lib/seo/indexability';

const makeDirectoryListing = (overrides: Partial<DirectoryListingData> = {}): DirectoryListingData => ({
  items: [
    { domain: 'a.com', title: 'A', description: 'One' },
    { domain: 'b.com', title: 'B', description: 'Two' },
    { domain: 'c.com', title: 'C', description: 'Three' },
  ],
  page: 1,
  pageSize: 24,
  total: 12,
  totalPages: 1,
  ...overrides,
});

const makeDirectoryStats = (overrides: Partial<DirectoryStats> = {}): DirectoryStats => ({
  type: 'technology',
  slug: 'react',
  total: 12,
  avgLegitimacyScore: 82,
  trafficDistribution: {
    top10k: 1,
    top100k: 4,
    top1m: 6,
    unranked: 1,
  },
  topTechnologies: [{ name: 'react', count: 12 }],
  topTags: [{ name: 'saas', count: 8 }],
  topCountries: [{ country: 'US', count: 6 }],
  hasTrafficData: 5,
  ...overrides,
});

const makeReport = (overrides: Partial<SiteReport> = {}): SiteReport => ({
  domain: 'example.com',
  meta: {
    title: 'Example',
    description: 'Example description',
    techStackDetected: ['Next.js'],
  },
  seo: {
    h1Count: 1,
    h2Count: 4,
    internalLinks: 25,
    externalLinks: 6,
    imagesCount: 8,
  },
  files: {
    hasRobots: true,
    hasSitemap: true,
    robotsSitemapUrls: ['https://example.com/sitemap.xml'],
  },
  dns: {
    provider: 'Cloudflare',
    nsRecords: ['ns1.example.com'],
  },
  trafficData: {
    monthlyVisits: 150000,
    globalRank: 2500,
    bounceRate: 42,
    avgVisitDuration: 180,
    pagesPerVisit: 3.4,
    topCountry: 'US',
    domainAgeYears: 5.5,
  },
  taxonomy: {
    iabCategory: 'Technology & Computing',
    tags: ['AI/ML'],
  },
  aiAnalysis: {
    business: {
      summary: 'B2B software company',
      model: 'Subscription SaaS',
    },
    risk: {
      score: 84,
      isSpam: false,
    },
  },
  visual: {
    screenshotUrl: 'https://cdn.example.com/example.jpg',
  },
  ...overrides,
});

describe('evaluateDirectoryIndexability', () => {
  it('indexes rich directory pages', () => {
    const decision = evaluateDirectoryIndexability(makeDirectoryListing(), makeDirectoryStats());
    expect(decision.index).toBe(true);
  });

  it('noindexes small directories', () => {
    const decision = evaluateDirectoryIndexability(
      makeDirectoryListing({ total: 4 }),
      makeDirectoryStats({ total: 4 }),
    );
    expect(decision).toMatchObject({ index: false, follow: true, reason: 'directory_total_below_threshold' });
  });
});

describe('evaluatePaginatedDirectoryIndexability', () => {
  it('indexes valid rich paginated pages under the cap', () => {
    const decision = evaluatePaginatedDirectoryIndexability({
      pageNum: 2,
      listing: makeDirectoryListing({
        page: 2,
        total: 60,
        totalPages: 3,
        items: new Array(6).fill(null).map((_, i) => ({ domain: `${i}.com`, title: `Title ${i}` })),
      }),
      baseDecision: evaluateDirectoryIndexability(makeDirectoryListing(), makeDirectoryStats()),
    });

    expect(decision.index).toBe(true);
  });

  it('noindexes thin paginated pages', () => {
    const decision = evaluatePaginatedDirectoryIndexability({
      pageNum: 2,
      listing: makeDirectoryListing({
        page: 2,
        total: 30,
        totalPages: 2,
        items: [{ domain: 'one.com', title: 'One' }],
      }),
      baseDecision: evaluateDirectoryIndexability(makeDirectoryListing(), makeDirectoryStats()),
    });

    expect(decision).toMatchObject({ index: false, follow: true, reason: 'directory_page_below_item_threshold' });
  });
});

describe('report and subpage indexability', () => {
  it('indexes rich base reports', () => {
    expect(evaluateReportIndexability(makeReport()).index).toBe(true);
  });

  it('noindexes sparse base reports', () => {
    const sparseReport = makeReport({
      meta: { title: 'Example', description: '' },
      seo: undefined,
      dns: undefined,
      trafficData: undefined,
      taxonomy: undefined,
      aiAnalysis: undefined,
      visual: undefined,
    });

    expect(evaluateReportIndexability(sparseReport)).toMatchObject({
      index: false,
      follow: true,
      reason: 'report_module_count_below_threshold',
    });
  });

  it('indexes rich traffic pages and noindexes sparse ones', () => {
    expect(evaluateTrafficSubPageIndexability(makeReport()).index).toBe(true);
    expect(evaluateTrafficSubPageIndexability(makeReport({
      trafficData: { bounceRate: 55 },
      radar: undefined,
    }))).toMatchObject({ index: false, follow: true });
  });

  it('indexes rich seo pages and noindexes sparse ones', () => {
    expect(evaluateSeoSubPageIndexability(makeReport()).index).toBe(true);
    expect(evaluateSeoSubPageIndexability(makeReport({
      meta: { title: '', description: '' },
      seo: { h1Count: 0, h2Count: 0, internalLinks: 0, externalLinks: 0, imagesCount: 0 },
      files: { hasRobots: false, hasSitemap: false, robotsSitemapUrls: [] },
    }))).toMatchObject({ index: false, follow: true });
  });

  it('indexes rich tech pages and noindexes sparse ones', () => {
    expect(evaluateTechSubPageIndexability(makeReport()).index).toBe(true);
    expect(evaluateTechSubPageIndexability(makeReport({
      meta: { title: 'Example', description: 'Example', techStackDetected: [] },
      dns: { provider: '', mxRecords: [], nsRecords: [], txtRecords: [] },
    }))).toMatchObject({ index: false, follow: true });
  });

  it('indexes rich business pages and noindexes sparse ones', () => {
    expect(evaluateBusinessSubPageIndexability(makeReport()).index).toBe(true);
    expect(evaluateBusinessSubPageIndexability(makeReport({
      aiAnalysis: {
        business: { summary: '', model: '', targetAudience: '' },
        risk: { score: undefined, isSpam: false },
      },
      ads: undefined,
      publisher: undefined,
      taxonomy: undefined,
    }))).toMatchObject({ index: false, follow: true });
  });
});

describe('evaluateAlternativesIndexability', () => {
  it('indexes alternatives pages with at least three candidates', () => {
    expect(evaluateAlternativesIndexability([
      { domain: 'a.com' },
      { domain: 'b.com' },
      { domain: 'c.com' },
    ])).toMatchObject({ index: true, follow: true });
  });

  it('noindexes alternatives pages below the threshold', () => {
    expect(evaluateAlternativesIndexability([
      { domain: 'a.com' },
      { domain: 'b.com' },
    ])).toMatchObject({ index: false, follow: true, reason: 'alternatives_below_threshold' });
  });
});
