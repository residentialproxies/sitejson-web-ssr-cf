import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import DomainLayout, { generateMetadata } from '@/app/data/[domain]/layout';
import { getSiteAlternatives, getSiteReportResult, getSiteProviderSummary } from '@/lib/api-client/client';
import { notFound, redirect } from 'next/navigation';

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
  notFound: vi.fn(),
  usePathname: vi.fn(() => '/data/example.com'),
}));

vi.mock('@/lib/api-client/client', () => ({
  getSiteReportResult: vi.fn(),
  getSiteProviderSummary: vi.fn(),
  getSiteAlternatives: vi.fn(),
}));

describe('domain layout canonical SEO behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('marks missing reports as noindex in metadata', async () => {
    vi.mocked(getSiteReportResult).mockResolvedValueOnce({ status: 'empty', data: null });

    const metadata = await generateMetadata({
      params: Promise.resolve({ domain: 'missing.com' }),
    });

    expect(metadata.robots).toEqual({ index: false, follow: false });
    expect(metadata.alternates?.canonical).toBe('/data/missing.com');
  });

  it('keeps transient upstream failures indexable in metadata', async () => {
    vi.mocked(getSiteReportResult).mockResolvedValueOnce({
      status: 'timeout',
      data: null,
      message: 'Upstream timeout.',
    });

    const metadata = await generateMetadata({
      params: Promise.resolve({ domain: 'openai.com' }),
    });

    expect(metadata.robots).toEqual({ index: true, follow: true });
    expect(metadata.alternates?.canonical).toBe('/data/openai.com');
  });

  it('marks sparse successful reports as noindex in metadata', async () => {
    vi.mocked(getSiteReportResult).mockResolvedValueOnce({
      status: 'success',
      data: {
        report: {
          domain: 'thin.com',
          meta: { title: 'Thin report', description: '' },
        },
        updatedAt: '2026-03-01T00:00:00Z',
        isStale: false,
      },
    });

    const metadata = await generateMetadata({
      params: Promise.resolve({ domain: 'thin.com' }),
    });

    expect(metadata.robots).toEqual({ index: false, follow: true });
    expect(metadata.alternates?.canonical).toBe('/data/thin.com');
  });

  it('calls notFound when the report does not exist', async () => {
    vi.mocked(getSiteReportResult).mockResolvedValueOnce({ status: 'empty', data: null });

    await DomainLayout({
      children: <div>child</div>,
      params: Promise.resolve({ domain: 'missing.com' }),
    });

    expect(notFound).toHaveBeenCalled();
  });

  it('keeps rendering children when the report fetch is temporarily unavailable', async () => {
    vi.mocked(getSiteReportResult).mockResolvedValueOnce({
      status: 'timeout',
      data: null,
      message: 'Upstream timeout.',
    });

    const page = await DomainLayout({
      children: <div>client fallback</div>,
      params: Promise.resolve({ domain: 'openai.com' }),
    });

    expect(notFound).not.toHaveBeenCalled();
    expect(page).toEqual(<div>client fallback</div>);
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
    expect(getSiteReportResult).not.toHaveBeenCalled();
  });

  it('uses canonical domain in JSON-LD and data fetch when route is canonical', async () => {
    vi.mocked(getSiteReportResult).mockResolvedValue({
      status: 'success',
      data: {
        report: {
          domain: 'example.com',
          updatedAt: '2026-03-01T00:00:00Z',
        },
        updatedAt: '2026-03-01T00:00:00Z',
        isStale: false,
      },
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
    expect(getSiteReportResult).toHaveBeenCalledWith('example.com');
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

  it('adds compare links to related resources when alternatives exist', async () => {
    vi.mocked(getSiteReportResult).mockResolvedValue({
      status: 'success',
      data: {
        report: {
          domain: 'example.com',
          updatedAt: '2026-03-01T00:00:00Z',
          meta: { title: 'Example', description: 'Example description', techStackDetected: ['Next.js'] },
          taxonomy: { iabCategory: 'Technology & Computing', tags: ['AI/ML'] },
          trafficData: { monthlyVisits: 100000, globalRank: 2000 },
          aiAnalysis: { risk: { score: 84, isSpam: false } },
        },
        updatedAt: '2026-03-01T00:00:00Z',
        isStale: false,
      },
    });
    vi.mocked(getSiteProviderSummary).mockResolvedValue({
      domain: 'example.com',
      updatedAt: '2026-03-01T00:00:00Z',
      providers: [],
    });
    vi.mocked(getSiteAlternatives).mockResolvedValue({
      algorithm: 'test',
      items: [
        { domain: 'alpha.com', reasons: ['same_category'] },
        { domain: 'beta.com', reasons: ['shared_tech_stack'] },
      ],
    });

    const page = await DomainLayout({
      children: <div>child</div>,
      params: Promise.resolve({ domain: 'example.com' }),
    });

    render(page as React.ReactElement);

    expect(screen.getByRole('link', { name: /compare example\.com vs alpha\.com/i })).toHaveAttribute(
      'href',
      '/compare/example.com/vs/alpha.com',
    );
  });
});
