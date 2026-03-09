import type { MetadataRoute } from 'next';
import { DIRECTORY_TYPE_ORDER, getDirectorySeed, type DirectoryType } from '@/lib/pseo';
import { normalizeDirectorySlug, normalizeDomainInput } from '@/lib/utils';

const BASE = (process.env.PUBLIC_SITE_BASE_URL ?? 'https://sitejson.com').replace(/\/+$/, '');
const API_BASE = process.env.SITEJSON_API_BASE_URL ?? 'http://127.0.0.1:8787';
const API_KEY = process.env.SITEJSON_API_KEY ?? '';
const DIRECTORY_TYPES = DIRECTORY_TYPE_ORDER;
const MAX_SLUGS_PER_TYPE = 50;
const PAGE_SIZE = 24;
const MAX_DIRECTORY_PAGES = 10;

type DomainEntry = {
  domain: string;
  updatedAt?: string;
};

type DirectoryEntry = {
  type: DirectoryType;
  slug: string;
  count?: number;
  topDomain?: string;
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

async function fetchSummaryDrivenData(): Promise<{ domains: DomainEntry[]; directories: DirectoryEntry[] }> {
  const headers = getHeaders();

  try {
    const batches = await Promise.all(
      DIRECTORY_TYPES.map(async (type) => {
        const seedSlug = normalizeDirectorySlug(getDirectorySeed(type).slug);
        const [summaryRes, seedRes] = await Promise.all([
          fetch(`${API_BASE}/api/v1/directory/${type}?limit=${MAX_SLUGS_PER_TYPE}`, {
            headers,
            next: { revalidate: 3600 },
          }),
          seedSlug
            ? fetch(`${API_BASE}/api/v1/directory/${type}/${seedSlug}?page=1&page_size=500`, {
                headers,
                next: { revalidate: 3600 },
              })
            : Promise.resolve(null),
        ]);

        const directories: DirectoryEntry[] = [];
        if (summaryRes.ok) {
          const body = (await summaryRes.json()) as DirectorySummaryResponse;
          for (const entry of body.data?.slugs ?? []) {
            const slug = normalizeDirectorySlug(entry.slug ?? '');
            if (!slug) continue;
            directories.push({
              type,
              slug,
              count: entry.count ?? 0,
              topDomain: normalizeDomainInput(entry.topDomain ?? ''),
            });
          }
        }

        const domains: DomainEntry[] = [];
        if (seedRes && seedRes.ok) {
          const body = (await seedRes.json()) as SeedDirectoryResponse;
          for (const item of body.data?.items ?? []) {
            const domain = normalizeDomainInput(item.domain ?? '');
            if (!domain) continue;
            domains.push({ domain, updatedAt: item.updated_at });
          }
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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { domains, directories } = await fetchSummaryDrivenData();
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${BASE}/directory`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE}/directory/category`, lastModified: now, changeFrequency: 'daily', priority: 0.7 },
    { url: `${BASE}/directory/technology`, lastModified: now, changeFrequency: 'daily', priority: 0.7 },
    { url: `${BASE}/directory/topic`, lastModified: now, changeFrequency: 'daily', priority: 0.7 },
    { url: `${BASE}/insights`, lastModified: now, changeFrequency: 'daily', priority: 0.65 },
    { url: `${BASE}/rss.xml`, lastModified: now, changeFrequency: 'daily', priority: 0.4 },
  ];

  const domainMap = new Map<string, Date>();
  for (const entry of domains) {
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
      domainMap.set(domain, now);
    }
  }

  const domainPages: MetadataRoute.Sitemap = Array.from(domainMap.entries()).flatMap(([domain, lastMod]) => [
    { url: `${BASE}/data/${domain}`, lastModified: lastMod, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/data/${domain}/traffic`, lastModified: lastMod, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${BASE}/data/${domain}/seo`, lastModified: lastMod, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${BASE}/data/${domain}/tech`, lastModified: lastMod, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${BASE}/data/${domain}/business`, lastModified: lastMod, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${BASE}/data/${domain}/alternatives`, lastModified: lastMod, changeFrequency: 'weekly', priority: 0.5 },
  ]);

  const directoryMap = new Map<string, DirectoryEntry>();
  for (const entry of directories) {
    const slug = normalizeDirectorySlug(entry.slug ?? '');
    if (!slug) continue;
    directoryMap.set(`${entry.type}/${slug}`, { ...entry, slug });
  }

  const directoryPages: MetadataRoute.Sitemap = Array.from(directoryMap.values()).map((entry) => ({
    url: `${BASE}/directory/${entry.type}/${entry.slug}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.65,
  }));

  const paginatedDirectoryPages: MetadataRoute.Sitemap = [];
  for (const entry of directoryMap.values()) {
    const total = entry.count ?? 0;
    if (total <= PAGE_SIZE) continue;
    const totalPages = Math.ceil(total / PAGE_SIZE);
    const maxPage = Math.min(totalPages, MAX_DIRECTORY_PAGES);
    for (let page = 2; page <= maxPage; page += 1) {
      paginatedDirectoryPages.push({
        url: `${BASE}/directory/${entry.type}/${entry.slug}/page/${page}`,
        lastModified: now,
        changeFrequency: 'daily',
        priority: 0.55,
      });
    }
  }

  return [...staticPages, ...domainPages, ...directoryPages, ...paginatedDirectoryPages];
}
