import type { MetadataRoute } from 'next';
import { normalizeDirectorySlug, normalizeDomainInput } from '@/lib/utils';

const BASE = (process.env.PUBLIC_SITE_BASE_URL ?? 'https://sitejson.com').replace(/\/+$/, '');
const API_BASE = process.env.SITEJSON_API_BASE_URL ?? 'http://127.0.0.1:8787';
const API_KEY = process.env.SITEJSON_API_KEY ?? '';
const DIRECTORY_TYPES = ['category', 'technology', 'topic'] as const;
type DirectoryType = typeof DIRECTORY_TYPES[number];
const DIRECTORY_SEEDS: Record<DirectoryType, string[]> = {
  category: ['technology'],
  technology: ['react'],
  topic: ['finance'],
};

interface DomainEntry {
  domain: string;
  updated_at?: string;
}

interface DirectoryEntry {
  type: DirectoryType;
  slug: string;
}

const toValidDate = (value?: string): Date | null => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

async function fetchSeededDirectoryData(): Promise<{ domains: DomainEntry[]; directories: DirectoryEntry[] }> {
  try {
    const headers: Record<string, string> = { accept: 'application/json' };
    if (API_KEY) headers['x-api-key'] = API_KEY;

    const batches = await Promise.all(
      DIRECTORY_TYPES.flatMap((type) => DIRECTORY_SEEDS[type].map(async (seedSlug) => {
        const normalizedSlug = normalizeDirectorySlug(seedSlug);
        if (!normalizedSlug) {
          return { domains: [] as DomainEntry[], directories: [] as DirectoryEntry[] };
        }

        const res = await fetch(`${API_BASE}/api/v1/directory/${type}/${normalizedSlug}?page=1&page_size=500`, {
          headers,
          next: { revalidate: 3600 },
        });
        if (!res.ok) {
          return { domains: [] as DomainEntry[], directories: [] as DirectoryEntry[] };
        }

        const body = await res.json() as {
          ok?: boolean;
          data?: { items?: Array<{ domain?: string; updated_at?: string }> };
        };
        const items = body?.data?.items ?? [];
        const domains = items
          .map((item) => normalizeDomainInput(item.domain ?? ''))
          .filter(Boolean)
          .map((domain) => ({ domain }));

        return {
          domains,
          directories: [{ type, slug: normalizedSlug }],
        };
      }))
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
  const { domains, directories } = await fetchSeededDirectoryData();
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE}/directory`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${BASE}/directory/category`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${BASE}/directory/technology`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${BASE}/directory/topic`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${BASE}/rss.xml`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.4,
    },
  ];

  const domainMap = new Map<string, Date>();
  for (const entry of domains) {
    const domain = normalizeDomainInput(entry.domain ?? '');
    if (!domain) continue;
    const candidateDate = toValidDate(entry.updated_at) ?? now;
    const existingDate = domainMap.get(domain);
    if (!existingDate || candidateDate > existingDate) {
      domainMap.set(domain, candidateDate);
    }
  }

  const domainPages: MetadataRoute.Sitemap = Array.from(domainMap.entries()).flatMap(([domain, lastMod]) => {
    return [
      {
        url: `${BASE}/data/${domain}`,
        lastModified: lastMod,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      },
      {
        url: `${BASE}/data/${domain}/traffic`,
        lastModified: lastMod,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      },
      {
        url: `${BASE}/data/${domain}/seo`,
        lastModified: lastMod,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      },
      {
        url: `${BASE}/data/${domain}/tech`,
        lastModified: lastMod,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      },
      {
        url: `${BASE}/data/${domain}/business`,
        lastModified: lastMod,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      },
    ];
  });

  const directoryUrls = new Set<string>();
  for (const entry of directories) {
    const type = entry.type.trim().toLowerCase() as DirectoryType;
    const slug = normalizeDirectorySlug(entry.slug ?? '');
    if (!DIRECTORY_TYPES.includes(type) || !slug) continue;
    directoryUrls.add(`${type}/${slug}`);
  }

  const directoryPages: MetadataRoute.Sitemap = Array.from(directoryUrls).map((path) => ({
    url: `${BASE}/directory/${path}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.65,
  }));

  return [...staticPages, ...domainPages, ...directoryPages];
}
