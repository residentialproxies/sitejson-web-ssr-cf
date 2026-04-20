import type { MetadataRoute } from 'next';
import type {
  AlternativesResponse,
  DirectoryStats,
  DirectoryStatsResponse,
  SiteReportResponse,
} from '@/lib/api-client/types';
import {
  DIRECTORY_SEEDS,
  DIRECTORY_TYPE_ORDER,
  FEATURED_REPORTS,
  getDirectorySeed,
  type DirectoryType,
} from '@/lib/pseo';
import {
  MAX_SITEMAP_DIRECTORY_PAGE,
  evaluateAlternativesIndexability,
  evaluateBusinessSubPageIndexability,
  evaluateDirectoryIndexability,
  evaluateReportIndexability,
  evaluateSeoSubPageIndexability,
  evaluateTechSubPageIndexability,
  evaluateTrafficSubPageIndexability,
} from '@/lib/seo/indexability';
import { normalizeDirectorySlug, normalizeDomainInput } from '@/lib/utils';

const BASE = (process.env.PUBLIC_SITE_BASE_URL ?? 'https://sitejson.com').replace(/\/+$/, '');
const API_BASE = process.env.SITEJSON_API_BASE_URL ?? 'http://127.0.0.1:8787';
const API_KEY = process.env.SITEJSON_API_KEY ?? '';
const DIRECTORY_TYPES = DIRECTORY_TYPE_ORDER;
const MAX_SLUGS_PER_TYPE = 50;
const PAGE_SIZE = 24;
const MAX_DOMAIN_CANDIDATES = 24;
const SITEMAP_REVALIDATE_SECONDS = 3600;

type DomainEntry = {
  domain: string;
  updatedAt?: string;
};

type DirectoryEntry = {
  type: DirectoryType;
  slug: string;
  count?: number;
  topDomain?: string;
  seeded?: boolean;
};

type DirectorySummaryResponse = {
  ok?: boolean;
  data?: {
    slugs?: Array<{
      slug?: string;
      count?: number;
      topDomain?: string;
    }>;
  };
};

type SeedDirectoryResponse = {
  ok?: boolean;
  data?: {
    items?: Array<{
      domain?: string;
      updated_at?: string;
    }>;
  };
};

const toValidDate = (value?: string): Date | null => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const getHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = { accept: 'application/json' };
  if (API_KEY) headers['x-api-key'] = API_KEY;
  return headers;
};

const fetchJson = async <T>(path: string): Promise<T | null> => {
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      headers: getHeaders(),
      next: { revalidate: SITEMAP_REVALIDATE_SECONDS },
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch {
    return null;
  }
};

async function fetchSummaryDrivenData(): Promise<{ domains: DomainEntry[]; directories: DirectoryEntry[] }> {
  try {
    const batches = await Promise.all(
      DIRECTORY_TYPES.map(async (type) => {
        const seedSlug = normalizeDirectorySlug(getDirectorySeed(type).slug);
        const [summaryBody, seedBody] = await Promise.all([
          fetchJson<DirectorySummaryResponse>(`/api/v1/directory/${type}?limit=${MAX_SLUGS_PER_TYPE}`),
          seedSlug
            ? fetchJson<SeedDirectoryResponse>(`/api/v1/directory/${type}/${seedSlug}?page=1&page_size=500`)
            : Promise.resolve(null),
        ]);

        const directories: DirectoryEntry[] = [];
        for (const entry of summaryBody?.data?.slugs ?? []) {
          const slug = normalizeDirectorySlug(entry.slug ?? '');
          if (!slug) continue;
          directories.push({
            type,
            slug,
            count: entry.count ?? 0,
            topDomain: normalizeDomainInput(entry.topDomain ?? ''),
          });
        }

        const domains: DomainEntry[] = [];
        for (const item of seedBody?.data?.items ?? []) {
          const domain = normalizeDomainInput(item.domain ?? '');
          if (!domain) continue;
          domains.push({ domain, updatedAt: item.updated_at });
        }

        for (const entry of directories) {
          if (entry.topDomain) {
            domains.push({ domain: entry.topDomain });
          }
        }

        return { domains, directories };
      }),
    );

    return {
      domains: batches.flatMap((batch) => batch.domains),
      directories: batches.flatMap((batch) => batch.directories),
    };
  } catch {
    return { domains: [], directories: [] };
  }
}

const buildStaticPages = (now: Date): MetadataRoute.Sitemap => [
  { url: BASE, lastModified: now, changeFrequency: 'daily', priority: 1 },
  { url: `${BASE}/directory`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
  { url: `${BASE}/directory/category`, lastModified: now, changeFrequency: 'daily', priority: 0.7 },
  { url: `${BASE}/directory/technology`, lastModified: now, changeFrequency: 'daily', priority: 0.7 },
  { url: `${BASE}/directory/topic`, lastModified: now, changeFrequency: 'daily', priority: 0.7 },
  { url: `${BASE}/insights`, lastModified: now, changeFrequency: 'daily', priority: 0.65 },
  { url: `${BASE}/rss.xml`, lastModified: now, changeFrequency: 'daily', priority: 0.4 },
];

const buildFallbackFeaturedPages = (now: Date): MetadataRoute.Sitemap =>
  FEATURED_REPORTS.flatMap((report) => ([
    { url: `${BASE}/data/${report.domain}`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/data/${report.domain}/traffic`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${BASE}/data/${report.domain}/seo`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${BASE}/data/${report.domain}/tech`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${BASE}/data/${report.domain}/business`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${BASE}/data/${report.domain}/alternatives`, lastModified: now, changeFrequency: 'weekly', priority: 0.5 },
  ]));

const buildSeedDirectoryFallback = (now: Date): MetadataRoute.Sitemap =>
  Object.values(DIRECTORY_SEEDS).map((seed) => ({
    url: `${BASE}/directory/${seed.type}/${seed.slug}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.65,
  }));

const uniqueDomainCandidates = (
  featuredDomains: DomainEntry[],
  discoveredDomains: DomainEntry[],
): DomainEntry[] => {
  const domainMap = new Map<string, Date>();

  for (const entry of [...featuredDomains, ...discoveredDomains]) {
    const domain = normalizeDomainInput(entry.domain ?? '');
    if (!domain) continue;
    const existingDate = domainMap.get(domain);
    const validDate = toValidDate(entry.updatedAt);

    if (validDate) {
      if (!existingDate || validDate > existingDate) {
        domainMap.set(domain, validDate);
      }
      continue;
    }

    if (!existingDate) {
      domainMap.set(domain, new Date());
    }
  }

  return Array.from(domainMap.entries())
    .map(([domain, date]) => ({ domain, updatedAt: date.toISOString() }))
    .slice(0, MAX_DOMAIN_CANDIDATES);
};

const uniqueDirectoryCandidates = (discoveredDirectories: DirectoryEntry[]): DirectoryEntry[] => {
  const seededDirectories: DirectoryEntry[] = Object.values(DIRECTORY_SEEDS).map((seed) => ({
    type: seed.type,
    slug: seed.slug,
    seeded: true,
  }));

  const directoryMap = new Map<string, DirectoryEntry>();
  for (const entry of [...seededDirectories, ...discoveredDirectories]) {
    const slug = normalizeDirectorySlug(entry.slug ?? '');
    if (!slug) continue;
    const key = `${entry.type}/${slug}`;
    const existing = directoryMap.get(key);
    directoryMap.set(key, {
      ...existing,
      ...entry,
      slug,
      seeded: Boolean(existing?.seeded || entry.seeded),
    });
  }

  return Array.from(directoryMap.values());
};

const fetchDirectoryStats = async (entry: DirectoryEntry): Promise<DirectoryStats | null> => {
  const response = await fetchJson<DirectoryStatsResponse>(
    `/api/v1/directory/${entry.type}/${entry.slug}/stats`,
  );

  if (!response?.ok || !response.data) {
    return null;
  }

  return response.data;
};

const fetchReport = async (
  domain: string,
): Promise<{ report: NonNullable<SiteReportResponse['data']>['report']; updatedAt: string } | null> => {
  const response = await fetchJson<SiteReportResponse>(`/api/v1/sites/${encodeURIComponent(domain)}`);

  if (!response?.ok || !response.data?.report) {
    return null;
  }

  return {
    report: response.data.report,
    updatedAt: response.data.freshness?.updated_at ?? response.data.report.updatedAt ?? '',
  };
};

const fetchAlternatives = async (domain: string) => {
  const response = await fetchJson<AlternativesResponse>(
    `/api/v1/sites/${encodeURIComponent(domain)}/alternatives`,
  );

  if (!response?.ok || !response.data) {
    return null;
  }

  return response.data;
};

const buildDynamicDirectoryPages = async (entries: DirectoryEntry[], now: Date): Promise<MetadataRoute.Sitemap> => {
  const settled = await Promise.all(
    entries.map(async (entry) => {
      if (!entry.seeded && (entry.count ?? 0) < 8) {
        return { entry, stats: null, include: false };
      }

      const stats = await fetchDirectoryStats(entry);
      if (!stats) {
        return { entry, stats: null, include: Boolean(entry.seeded) };
      }

      const decision = evaluateDirectoryIndexability(null, stats);
      return { entry, stats, include: decision.index };
    }),
  );

  const pages: MetadataRoute.Sitemap = [];
  for (const { entry, stats, include } of settled) {
    if (!include && !entry.seeded) continue;

    pages.push({
      url: `${BASE}/directory/${entry.type}/${entry.slug}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.65,
    });

    const total = stats?.total ?? entry.count ?? 0;
    if (total <= PAGE_SIZE) continue;

    const totalPages = Math.ceil(total / PAGE_SIZE);
    const maxPage = Math.min(totalPages, MAX_SITEMAP_DIRECTORY_PAGE);
    for (let page = 2; page <= maxPage; page += 1) {
      const remainingItems = total - ((page - 1) * PAGE_SIZE);
      const itemsOnPage = Math.max(0, Math.min(PAGE_SIZE, remainingItems));
      if (itemsOnPage < 6) continue;

      pages.push({
        url: `${BASE}/directory/${entry.type}/${entry.slug}/page/${page}`,
        lastModified: now,
        changeFrequency: 'daily',
        priority: 0.55,
      });
    }
  }

  return pages;
};

const buildDynamicDomainPages = async (entries: DomainEntry[], now: Date): Promise<MetadataRoute.Sitemap> => {
  const pages: MetadataRoute.Sitemap = [];

  const reports = await Promise.all(
    entries.map(async (entry) => ({
      entry,
      data: await fetchReport(entry.domain),
    })),
  );

  for (const { entry, data } of reports) {
    if (!data) {
      if (FEATURED_REPORTS.some((report) => report.domain === entry.domain)) {
        pages.push(
          ...buildFallbackFeaturedPages(toValidDate(entry.updatedAt) ?? now).filter((page) => (
            page.url.startsWith(`${BASE}/data/${entry.domain}`)
          )),
        );
      }
      continue;
    }

    const lastModified = toValidDate(data.updatedAt) ?? toValidDate(entry.updatedAt) ?? now;
    const reportDecision = evaluateReportIndexability(data.report);
    if (!reportDecision.index) {
      continue;
    }

    pages.push({
      url: `${BASE}/data/${entry.domain}`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    });

    const trafficDecision = evaluateTrafficSubPageIndexability(data.report);
    if (trafficDecision.index) {
      pages.push({
        url: `${BASE}/data/${entry.domain}/traffic`,
        lastModified,
        changeFrequency: 'weekly',
        priority: 0.6,
      });
    }

    const seoDecision = evaluateSeoSubPageIndexability(data.report);
    if (seoDecision.index) {
      pages.push({
        url: `${BASE}/data/${entry.domain}/seo`,
        lastModified,
        changeFrequency: 'weekly',
        priority: 0.6,
      });
    }

    const techDecision = evaluateTechSubPageIndexability(data.report);
    if (techDecision.index) {
      pages.push({
        url: `${BASE}/data/${entry.domain}/tech`,
        lastModified,
        changeFrequency: 'weekly',
        priority: 0.6,
      });
    }

    const businessDecision = evaluateBusinessSubPageIndexability(data.report);
    if (businessDecision.index) {
      pages.push({
        url: `${BASE}/data/${entry.domain}/business`,
        lastModified,
        changeFrequency: 'weekly',
        priority: 0.6,
      });
    }

    const alternatives = await fetchAlternatives(entry.domain);
    const alternativesDecision = evaluateAlternativesIndexability(alternatives?.items ?? null);
    if (alternativesDecision.index) {
      pages.push({
        url: `${BASE}/data/${entry.domain}/alternatives`,
        lastModified,
        changeFrequency: 'weekly',
        priority: 0.5,
      });
    }
  }

  return pages;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticPages = buildStaticPages(now);
  const featuredDomains: DomainEntry[] = FEATURED_REPORTS.map((report) => ({
    domain: report.domain,
    updatedAt: now.toISOString(),
  }));

  const { domains, directories } = await fetchSummaryDrivenData();
  const domainCandidates = uniqueDomainCandidates(featuredDomains, domains);
  const directoryCandidates = uniqueDirectoryCandidates(directories);

  const dynamicDirectoryPages = await buildDynamicDirectoryPages(directoryCandidates, now);
  const dynamicDomainPages = await buildDynamicDomainPages(domainCandidates, now);

  if (dynamicDirectoryPages.length === 0 && dynamicDomainPages.length === 0) {
    return [
      ...staticPages,
      ...buildSeedDirectoryFallback(now),
      ...buildFallbackFeaturedPages(now),
    ];
  }

  return [
    ...staticPages,
    ...dynamicDirectoryPages,
    ...dynamicDomainPages,
  ];
}
