import { describe, expect, it } from 'vitest';
import { getRelatedDirectoryLinks } from '@/lib/pseo';

describe('getRelatedDirectoryLinks', () => {
  it('prioritizes live reports, compare links, and pivots from stats and items', () => {
    const links = getRelatedDirectoryLinks({
      type: 'category',
      slug: 'finance',
      items: [
        {
          domain: 'alpha.com',
          title: 'Alpha',
          techStack: ['Next.js', 'Stripe'],
          tags: ['payments', 'b2b'],
        },
        {
          domain: 'beta.com',
          title: 'Beta',
          techStack: ['React'],
          tags: ['fintech'],
        },
      ],
      stats: {
        type: 'category',
        slug: 'finance',
        total: 120,
        avgLegitimacyScore: 77,
        trafficDistribution: { top10k: 2, top100k: 10, top1m: 30, unranked: 78 },
        topTechnologies: [{ name: 'Next.js', count: 20 }, { name: 'React', count: 18 }],
        topTags: [{ name: 'payments', count: 16 }, { name: 'saas', count: 12 }],
        topCountries: [{ country: 'United States', count: 42 }],
        hasTrafficData: 55,
      },
    });

    expect(links[0].href).toBe('/directory/category');
    expect(links.some((link) => link.href === '/data/alpha.com')).toBe(true);
    expect(links.some((link) => link.href === '/data/beta.com')).toBe(true);
    expect(links.some((link) => link.href === '/compare/alpha.com/vs/beta.com')).toBe(true);
    expect(links.some((link) => link.href === '/directory/technology/nextjs')).toBe(true);
    expect(links.some((link) => link.href === '/directory/topic/payments')).toBe(true);
    expect(links.every((link) => link.eyebrow)).toBe(true);
  });

  it('falls back to stable browse paths when cluster data is limited', () => {
    const links = getRelatedDirectoryLinks({
      type: 'technology',
      slug: 'react',
      items: [],
      stats: null,
      limit: 4,
    });

    expect(links).toHaveLength(4);
    expect(links[0].href).toBe('/directory/technology');
    expect(links.some((link) => link.href === '/directory')).toBe(true);
    expect(links.some((link) => link.href === '/directory/category/technology')).toBe(true);
    expect(links.some((link) => link.href === '/directory/topic/finance')).toBe(true);
  });
});
