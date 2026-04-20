import { beforeEach, describe, expect, it, vi } from 'vitest';
import React from 'react';
import DirectoryIndexPage from '@/app/directory/page';
import DirectoryTypePage, { generateMetadata as generateTypeMetadata } from '@/app/directory/[type]/page';
import DirectorySlugPage, { generateMetadata as generateSlugMetadata } from '@/app/directory/[type]/[slug]/page';
import {
  getDirectoryListingResult,
  getDirectoryStatsResult,
  getDirectoryTypeSummaryResult,
  getGlobalInsightsResult,
} from '@/lib/api-client/client';
import { notFound, redirect } from 'next/navigation';

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
  notFound: vi.fn(),
}));

vi.mock('@/lib/api-client/client', () => ({
  getDirectoryListingResult: vi.fn(),
  getDirectoryTypeSummaryResult: vi.fn().mockResolvedValue({ status: 'empty', data: null }),
  getDirectoryStatsResult: vi.fn().mockResolvedValue({ status: 'empty', data: null }),
  getGlobalInsightsResult: vi.fn().mockResolvedValue({ status: 'empty', data: null }),
}));

describe('directory routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getDirectoryListingResult).mockResolvedValue({
      status: 'success',
      data: {
        items: [
          { domain: 'example.com', title: 'Example', description: 'One', rank: 123 },
          { domain: 'test.com', title: 'Test', description: 'Two', rank: 456 },
          { domain: 'demo.com', title: 'Demo', description: 'Three', rank: 789 },
        ],
        page: 1,
        total: 12,
        pageSize: 24,
        totalPages: 1,
      },
    });
    vi.mocked(getDirectoryStatsResult).mockResolvedValue({
      status: 'success',
      data: {
        type: 'category',
        slug: 'marketing',
        total: 12,
        avgLegitimacyScore: 81,
        trafficDistribution: { top10k: 1, top100k: 4, top1m: 6, unranked: 1 },
        topTechnologies: [{ name: 'react', count: 8 }],
        topTags: [{ name: 'marketing', count: 12 }],
        topCountries: [{ country: 'US', count: 7 }],
        hasTrafficData: 5,
      },
    });
    vi.mocked(getDirectoryTypeSummaryResult).mockResolvedValue({ status: 'empty', data: null });
    vi.mocked(getGlobalInsightsResult).mockResolvedValue({ status: 'empty', data: null });
  });

  it('renders /directory as an indexable hub instead of redirecting', async () => {
    const page = await DirectoryIndexPage();
    expect(redirect).not.toHaveBeenCalled();
    expect(page).toBeTruthy();
  });

  it('renders /directory/category as a hub page instead of redirecting', async () => {
    const page = await DirectoryTypePage({ params: Promise.resolve({ type: 'category' }) });
    expect(redirect).not.toHaveBeenCalled();
    expect(page).toBeTruthy();
  });

  it('returns notFound for unknown directory type hubs', async () => {
    const page = await DirectoryTypePage({ params: Promise.resolve({ type: 'unknown' }) });
    expect(notFound).toHaveBeenCalled();
    expect(page).toBeNull();
  });

  it('redirects non-canonical directory slugs to canonical slug format', async () => {
    await DirectorySlugPage({ params: Promise.resolve({ type: 'technology', slug: 'Next.js' }) });
    expect(redirect).toHaveBeenCalledWith('/directory/technology/nextjs');
  });

  it('redirects empty slug to the type seed slug', async () => {
    await DirectorySlugPage({ params: Promise.resolve({ type: 'topic', slug: '   ' }) });
    expect(redirect).toHaveBeenCalledWith('/directory/topic/finance');
  });

  it('returns notFound for invalid directory types on slug pages', async () => {
    const page = await DirectorySlugPage({ params: Promise.resolve({ type: 'unknown', slug: 'marketing' }) });
    expect(notFound).toHaveBeenCalled();
    expect(page).toBeNull();
  });

  it('uses canonical type and slug for backend fetch when route is canonical', async () => {
    await DirectorySlugPage({ params: Promise.resolve({ type: 'category', slug: 'marketing' }) });
    expect(getDirectoryListingResult).toHaveBeenCalledWith('category', 'marketing', 1, 24);
  });

  it('renders parseable JSON-LD schema for canonical directory routes', async () => {
    const page = await DirectorySlugPage({ params: Promise.resolve({ type: 'category', slug: 'marketing' }) });
    const fragment = page as React.ReactElement<{ children: React.ReactNode }>;
    const children = React.Children.toArray(fragment.props.children);
    const scriptNode = children.find((child) => React.isValidElement(child) && child.type === 'script') as React.ReactElement<{ dangerouslySetInnerHTML?: { __html?: string } }> | undefined;
    const parsed = JSON.parse(scriptNode?.props.dangerouslySetInnerHTML?.__html ?? '{}') as {
      '@graph'?: Array<{ '@type'?: string; url?: string }>;
    };
    const webPageNode = parsed['@graph']?.find((item) => item['@type'] === 'WebPage');

    expect(webPageNode?.url).toBe('https://sitejson.com' + '/directory/category/' + 'marketing');
  });

  it('builds indexable metadata for type hub routes', async () => {
    const metadata = await generateTypeMetadata({ params: Promise.resolve({ type: 'technology' }) });
    expect(metadata.alternates?.canonical).toBe('/directory/technology');
    expect(metadata.title).toBe('Technology Directory Hub');
  });

  it('marks invalid type metadata as noindex', async () => {
    const metadata = await generateTypeMetadata({ params: Promise.resolve({ type: 'unknown' }) });
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });

  it('marks empty detail pages as noindex', async () => {
    vi.mocked(getDirectoryListingResult).mockResolvedValueOnce({
      status: 'empty',
      data: { items: [], page: 1, total: 0, pageSize: 24, totalPages: 0 },
    });

    const metadata = await generateSlugMetadata({ params: Promise.resolve({ type: 'topic', slug: 'finance' }) });
    expect(metadata.robots).toMatchObject({ index: false, follow: true });
  });

  it('marks unavailable detail pages as noindex', async () => {
    vi.mocked(getDirectoryListingResult).mockResolvedValueOnce({
      status: 'unavailable',
      data: { items: [], page: 1, total: 0, pageSize: 24, totalPages: 0 },
      message: 'Directory request failed',
    });

    const metadata = await generateSlugMetadata({ params: Promise.resolve({ type: 'topic', slug: 'finance' }) });
    expect(metadata.robots).toMatchObject({ index: false, follow: true });
  });

  it('marks low-signal successful detail pages as noindex', async () => {
    vi.mocked(getDirectoryListingResult).mockResolvedValueOnce({
      status: 'success',
      data: {
        items: [{ domain: 'example.com', title: 'Example' }],
        page: 1,
        total: 4,
        pageSize: 24,
        totalPages: 1,
      },
    });
    vi.mocked(getDirectoryStatsResult).mockResolvedValueOnce({
      status: 'empty',
      data: null,
    });

    const metadata = await generateSlugMetadata({ params: Promise.resolve({ type: 'topic', slug: 'finance' }) });
    expect(metadata.robots).toMatchObject({ index: false, follow: true });
  });

  it('marks rich successful detail pages as indexable', async () => {
    const metadata = await generateSlugMetadata({ params: Promise.resolve({ type: 'topic', slug: 'finance' }) });
    expect(metadata.robots).toMatchObject({ index: true, follow: true });
  });
});
