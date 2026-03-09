import { beforeEach, describe, expect, it, vi } from 'vitest';
import React from 'react';
import PaginatedDirectoryPage, { generateMetadata } from '@/app/directory/[type]/[slug]/page/[pageNum]/page';
import { getDirectory } from '@/lib/api-client/client';
import { redirect, notFound } from 'next/navigation';

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
  notFound: vi.fn(),
}));

vi.mock('@/lib/api-client/client', () => ({
  getDirectory: vi.fn(),
}));

const mockParams = (type: string, slug: string, pageNum: string) =>
  Promise.resolve({ type, slug, pageNum });

describe('paginated directory routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getDirectory).mockResolvedValue({
      items: [
        { domain: 'example.com', title: 'Example', rank: 123 },
        { domain: 'test.com', title: 'Test', rank: 456 },
      ],
      pagination: {
        page: 2,
        total: 50,
        page_size: 24,
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
    vi.mocked(getDirectory).mockResolvedValueOnce({
      items: [],
      pagination: { page: 99, total: 50, page_size: 24 },
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
    expect(getDirectory).toHaveBeenCalledWith('category', 'marketing', 3, 24);
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
    vi.mocked(getDirectory).mockResolvedValueOnce({
      items: [],
      pagination: { page: 1, total: 48, page_size: 24 },
    });
    const metadata = await generateMetadata({ params: mockParams('category', 'marketing', '2') });
    const alternates = metadata.alternates as Record<string, string>;
    expect(alternates.next).toBeUndefined();
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
