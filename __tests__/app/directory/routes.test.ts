import { beforeEach, describe, expect, it, vi } from 'vitest';
import React from 'react';
import DirectoryIndexPage from '@/app/directory/page';
import DirectoryTypePage from '@/app/directory/[type]/page';
import DirectorySlugPage from '@/app/directory/[type]/[slug]/page';
import { getDirectory } from '@/lib/api-client/client';
import { redirect } from 'next/navigation';

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

vi.mock('@/lib/api-client/client', () => ({
  getDirectory: vi.fn(),
}));

describe('directory fallback routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getDirectory).mockResolvedValue({
      items: [],
      pagination: {
        page: 1,
        total: 0,
        page_size: 24,
      },
    });
  });

  it('redirects /directory to a valid default listing', () => {
    DirectoryIndexPage();
    expect(redirect).toHaveBeenCalledWith('/directory/category/technology');
  });

  it('redirects /directory/category to a valid default slug', async () => {
    await DirectoryTypePage({ params: Promise.resolve({ type: 'category' }) });
    expect(redirect).toHaveBeenCalledWith('/directory/category/technology');
  });

  it('redirects unknown directory type to safe default route', async () => {
    await DirectoryTypePage({ params: Promise.resolve({ type: 'unknown' }) });
    expect(redirect).toHaveBeenCalledWith('/directory/category/technology');
  });

  it('redirects non-canonical directory slugs to canonical slug format', async () => {
    await DirectorySlugPage({ params: Promise.resolve({ type: 'technology', slug: 'Next.js' }) });
    expect(redirect).toHaveBeenCalledWith('/directory/technology/nextjs');
  });

  it('redirects empty/invalid slug to type default slug', async () => {
    await DirectorySlugPage({ params: Promise.resolve({ type: 'topic', slug: '   ' }) });
    expect(redirect).toHaveBeenCalledWith('/directory/topic/finance');
  });

  it('uses normalized type and slug for backend fetch when route is canonical', async () => {
    await DirectorySlugPage({ params: Promise.resolve({ type: 'category', slug: 'marketing' }) });
    expect(redirect).not.toHaveBeenCalled();
    expect(getDirectory).toHaveBeenCalledWith('category', 'marketing', 1, 24);
  });

  it('renders parseable JSON-LD schema for canonical directory routes', async () => {
    const page = await DirectorySlugPage({ params: Promise.resolve({ type: 'category', slug: 'marketing' }) });
    expect(redirect).not.toHaveBeenCalled();

    const fragment = page as React.ReactElement<{ children: React.ReactNode }>;
    const children = React.Children.toArray(fragment.props.children);
    const scriptNode = children.find((child) => (
      React.isValidElement(child) && child.type === 'script'
    )) as React.ReactElement<{ dangerouslySetInnerHTML?: { __html?: string } }> | undefined;

    expect(scriptNode).toBeDefined();
    const jsonLdText = scriptNode?.props.dangerouslySetInnerHTML?.__html;
    expect(typeof jsonLdText).toBe('string');

    const parsed = JSON.parse(jsonLdText as string) as {
      '@graph'?: Array<{ '@type'?: string; url?: string }>;
    };
    const webPageNode = parsed['@graph']?.find((item) => item['@type'] === 'WebPage');

    expect(parsed['@graph']).toBeDefined();
    expect(webPageNode?.url).toBe('https://sitejson.com/directory/category/marketing');
  });
});
