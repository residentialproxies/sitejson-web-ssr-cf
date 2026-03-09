import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import DomainLayout, { generateMetadata } from '@/app/data/[domain]/layout';
import { getSiteAlternatives, getSiteReport, getSiteProviderSummary } from '@/lib/api-client/client';
import { notFound, redirect } from 'next/navigation';

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
  notFound: vi.fn(),
}));

vi.mock('@/lib/api-client/client', () => ({
  getSiteReport: vi.fn(),
  getSiteProviderSummary: vi.fn(),
  getSiteAlternatives: vi.fn(),
}));

describe('domain layout canonical SEO behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('marks missing reports as noindex in metadata', async () => {
    vi.mocked(getSiteReport).mockResolvedValueOnce(null);

    const metadata = await generateMetadata({
      params: Promise.resolve({ domain: 'missing.com' }),
    });

    expect(metadata.robots).toEqual({ index: false, follow: false });
    expect(metadata.alternates?.canonical).toBe('/data/missing.com');
  });

  it('calls notFound when the report does not exist', async () => {
    vi.mocked(getSiteReport).mockResolvedValueOnce(null);

    await DomainLayout({
      children: <div>child</div>,
      params: Promise.resolve({ domain: 'missing.com' }),
    });

    expect(notFound).toHaveBeenCalled();
  });

  it('redirects non-canonical domain params to lowercase canonical route', async () => {
    vi.mocked(getSiteProviderSummary).mockResolvedValue(null);
    vi.mocked(getSiteAlternatives).mockResolvedValue(null);

    const page = await DomainLayout({
      children: <div>child</div>,
      params: Promise.resolve({ domain: 'Example.COM' }),
    });

    expect(page).toBeNull();
    expect(redirect).toHaveBeenCalledWith('/data/example.com');
    expect(getSiteReport).not.toHaveBeenCalled();
  });

  it('uses canonical domain in JSON-LD and data fetch when route is canonical', async () => {
    vi.mocked(getSiteReport).mockResolvedValue({
      report: {
        domain: 'example.com',
        updatedAt: '2026-03-01T00:00:00Z',
      },
      updatedAt: '2026-03-01T00:00:00Z',
      isStale: false,
    });
    vi.mocked(getSiteProviderSummary).mockResolvedValue({
      domain: 'example.com',
      updatedAt: '2026-03-01T00:00:00Z',
      providers: [],
    });
    vi.mocked(getSiteAlternatives).mockResolvedValue({
      algorithm: 'test',
      items: [],
    });

    const page = await DomainLayout({
      children: <div>child</div>,
      params: Promise.resolve({ domain: 'example.com' }),
    });

    expect(redirect).not.toHaveBeenCalled();
    expect(getSiteReport).toHaveBeenCalledWith('example.com');
    expect(getSiteProviderSummary).toHaveBeenCalledWith('example.com');

    const root = page as React.ReactElement<{ children: React.ReactNode }>;
    const children = React.Children.toArray(root.props.children);
    const scriptNode = children.find((child) => (
      React.isValidElement(child) && child.type === 'script'
    )) as React.ReactElement<{ dangerouslySetInnerHTML?: { __html?: string } }> | undefined;

    expect(scriptNode).toBeDefined();
    const jsonLdText = scriptNode?.props.dangerouslySetInnerHTML?.__html;
    const parsed = JSON.parse(jsonLdText as string) as {
      '@graph'?: Array<{ '@type'?: string; url?: string }>;
    };
    const webPageNode = parsed['@graph']?.find((item) => item['@type'] === 'WebPage');

    expect(webPageNode?.url).toBe('https://sitejson.com/data/example.com');
  });
});
