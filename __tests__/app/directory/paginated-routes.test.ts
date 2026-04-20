import { beforeEach, describe, expect, it, vi } from 'vitest';
import React from 'react';
import PaginatedDirectoryPage, { generateMetadata } from '@/app/directory/[type]/[slug]/page/[pageNum]/page';
import { getDirectoryListingResult, getDirectoryStatsResult } from '@/lib/api-client/client';
import { redirect, notFound } from 'next/navigation';

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
  notFound: vi.fn(),
}));

vi.mock('@/lib/api-client/client', () => ({
  getDirectoryListingResult: vi.fn(),
  getDirectoryStatsResult: vi.fn(),
}));

const mockParams = (type: string, slug: string, pageNum: string) =>
  Promise.resolve({ type, slug, pageNum });

describe('paginated directory routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getDirectoryListingResult).mockResolvedValue({
      status: 'success',
      data: {
        items: new Array(6).fill(null).map((_, index) => ({
          domain: `example-${index}.com`,
          title: `Example ${index}`,
          rank: 100 + index,
        })),
        page: 2,
        total: 50,
        pageSize: 24,
        totalPages: 3,
      },
    });
    vi.mocked(getDirectoryStatsResult).mockResolvedValue({
      status: 'success',
      data: {
        type: 'category',
        slug: 'marketing',
        total: 50,
        avgLegitimacyScore: 81,
        trafficDistribution: { top10k: 1, top100k: 4, top1m: 40, unranked: 5 },
        topTechnologies: [{ name: 'react', count: 10 }],
        topTags: [{ name: 'marketing', count: 50 }],
        topCountries: [{ country: 'US', count: 20 }],
        hasTrafficData: 10,
      },
    });
  });

  it('redirects page 1 to canonical directory URL', async () => {
    await PaginatedDirectoryPage({ params: mockParams('category', 'marketing', '1') });
    expect(redirect).toHaveBeenCalledWith('/directory/category/marketing');
  });

  it('returns notFound for invalid directory types', async () => {
    const page = await PaginatedDirectoryPage({ params: mockParams('unknown', 'marketing', '2') });
    expect(notFound).toHaveBeenCalled();
    expect(page).toBeNull();
  });

  it('returns notFound for invalid page numbers', async () => {
    await PaginatedDirectoryPage({ params: mockParams('category', 'marketing', 'abc') });
    expect(notFound).toHaveBeenCalled();
  });

  it('returns notFound for negative page numbers', async () => {
    await PaginatedDirectoryPage({ params: mockParams('category', 'marketing', '-1') });
    expect(notFound).toHaveBeenCalled();
  });

  it('returns notFound when page exceeds totalPages', async () => {
    vi.mocked(getDirectoryListingResult).mockResolvedValueOnce({
      status: 'empty',
      data: { items: [], page: 99, total: 50, pageSize: 24, totalPages: 3 },
    });
    await PaginatedDirectoryPage({ params: mockParams('category', 'marketing', '99') });
    expect(notFound).toHaveBeenCalled();
  });

  it('redirects non-canonical slug to canonical URL with page', async () => {
    await PaginatedDirectoryPage({ params: mockParams('technology', 'Next.js', '2') });
    expect(redirect).toHaveBeenCalledWith('/directory/technology/' + 'nextjs/page/2');
  });

  it('fetches the correct page from the API', async () => {
    await PaginatedDirectoryPage({ params: mockParams('category', 'marketing', '3') });
    expect(getDirectoryListingResult).toHaveBeenCalledWith('category', 'marketing', 3, 24);
  });

  it('renders DirectoryContent with SSR page data', async () => {
    const page = await PaginatedDirectoryPage({ params: mockParams('category', 'marketing', '2') });
    expect(page).toBeTruthy();
    expect(redirect).not.toHaveBeenCalled();
    expect(notFound).not.toHaveBeenCalled();
  });

  it('renders JSON-LD with page context', async () => {
    const page = await PaginatedDirectoryPage({ params: mockParams('category', 'marketing', '2') });
    const fragment = page as React.ReactElement<{ children: React.ReactNode }>;
    const children = React.Children.toArray(fragment.props.children);
    const scriptNode = children.find(
      (child) => React.isValidElement(child) && child.type === 'script',
    ) as React.ReactElement<{ dangerouslySetInnerHTML?: { __html?: string } }> | undefined;
    const parsed = JSON.parse(scriptNode?.props.dangerouslySetInnerHTML?.__html ?? '{}') as {
      '@graph'?: Array<{ '@type'?: string; url?: string; name?: string }>;
    };
    const webPageNode = parsed['@graph']?.find((item) => item['@type'] === 'WebPage');
    expect(webPageNode?.url).toBe('https://sitejson.com' + '/directory/category/' + 'marketing/page/2');
    expect(webPageNode?.name).toContain('Page 2');
  });

  it('generates metadata with page number in title', async () => {
    const metadata = await generateMetadata({ params: mockParams('category', 'marketing', '2') });
    expect(metadata.title).toBe('Top Marketing Websites — Page 2');
  });

  it('generates metadata with prev/next alternates', async () => {
    const metadata = await generateMetadata({ params: mockParams('category', 'marketing', '2') });
    const alternates = metadata.alternates as Record<string, string>;
    expect(alternates.canonical).toBe('/directory/category/' + 'marketing/page/2');
    expect(alternates.prev).toBe('/directory/category/marketing');
    expect(alternates.next).toBe('/directory/category/' + 'marketing/page/3');
  });

  it('omits next alternate on last page', async () => {
    vi.mocked(getDirectoryListingResult)
      .mockResolvedValueOnce({
        status: 'success',
        data: {
          items: new Array(6).fill(null).map((_, index) => ({
            domain: `base-${index}.com`,
            title: `Base ${index}`,
          })),
          page: 1,
          total: 48,
          pageSize: 24,
          totalPages: 2,
        },
      })
      .mockResolvedValueOnce({
        status: 'success',
        data: {
          items: new Array(6).fill(null).map((_, index) => ({
            domain: `last-${index}.com`,
            title: `Last ${index}`,
          })),
          page: 2,
          total: 48,
          pageSize: 24,
          totalPages: 2,
        },
      });
    const metadata = await generateMetadata({ params: mockParams('category', 'marketing', '2') });
    const alternates = metadata.alternates as Record<string, string>;
    expect(alternates.next).toBeUndefined();
  });

  it('marks unavailable paginated metadata as noindex', async () => {
    vi.mocked(getDirectoryListingResult).mockResolvedValueOnce({
      status: 'timeout',
      data: { items: [], page: 2, total: 0, pageSize: 24, totalPages: 0 },
      message: 'Directory request timed out',
    });

    const metadata = await generateMetadata({ params: mockParams('category', 'marketing', '2') });
    expect(metadata.robots).toMatchObject({ index: false, follow: true });
  });

  it('marks thin paginated metadata as noindex', async () => {
    vi.mocked(getDirectoryListingResult).mockResolvedValueOnce({
      status: 'success',
      data: {
        items: [{ domain: 'one.com', title: 'One' }],
        page: 2,
        total: 30,
        pageSize: 24,
        totalPages: 2,
      },
    });

    const metadata = await generateMetadata({ params: mockParams('category', 'marketing', '2') });
    expect(metadata.robots).toMatchObject({ index: false, follow: true });
  });

  it('marks paginated metadata above the cap as noindex', async () => {
    vi.mocked(getDirectoryListingResult).mockResolvedValue({
      status: 'success',
      data: {
        items: new Array(24).fill(null).map((_, index) => ({
          domain: `page-${index}.com`,
          title: `Page ${index}`,
        })),
        page: 7,
        total: 240,
        pageSize: 24,
        totalPages: 10,
      },
    });

    const metadata = await generateMetadata({ params: mockParams('category', 'marketing', '7') });
    expect(metadata.robots).toMatchObject({ index: false, follow: true });
  });

  it('returns empty metadata for invalid page number', async () => {
    const metadata = await generateMetadata({ params: mockParams('category', 'marketing', 'abc') });
    expect(metadata.title).toBeUndefined();
  });

  it('returns empty metadata for invalid directory type', async () => {
    const metadata = await generateMetadata({ params: mockParams('unknown', 'marketing', '2') });
    expect(metadata.title).toBeUndefined();
  });
});
