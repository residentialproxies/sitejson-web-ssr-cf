import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ComparePage, { generateMetadata } from '@/app/compare/[domainA]/vs/[domainB]/page';
import { getSiteReport } from '@/lib/api-client/client';
import { notFound, redirect } from 'next/navigation';
import type { SiteReport } from '@/lib/api-client/types';

vi.mock('@/lib/api-client/client', () => ({
  getSiteReport: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
  notFound: vi.fn(),
}));

const makeReport = (overrides: Partial<SiteReport> = {}): SiteReport => ({
  domain: 'example.com',
  trafficData: {
    monthlyVisits: 500000,
    globalRank: 1500,
    bounceRate: 35.2,
    domainAgeYears: 8.5,
  },
  aiAnalysis: {
    risk: { score: 85 },
  },
  meta: { techStackDetected: ['React', 'Next.js'] },
  taxonomy: { iabCategory: 'Technology' },
  ...overrides,
});

describe('ComparePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects when domainA > domainB alphabetically', async () => {
    await ComparePage({ params: Promise.resolve({ domainA: 'zebra.com', domainB: 'alpha.com' }) });
    expect(redirect).toHaveBeenCalledWith('/compare/alpha.com/vs/zebra.com');
  });

  it('renders comparison table when both reports exist', async () => {
    vi.mocked(getSiteReport).mockResolvedValueOnce({
      report: makeReport({ domain: 'alpha.com' }),
      isStale: false,
      updatedAt: '2026-01-01',
    });
    vi.mocked(getSiteReport).mockResolvedValueOnce({
      report: makeReport({ domain: 'beta.com', trafficData: { monthlyVisits: 300000, globalRank: 2000, bounceRate: 40, domainAgeYears: 5 } }),
      isStale: false,
      updatedAt: '2026-01-01',
    });

    const page = await ComparePage({ params: Promise.resolve({ domainA: 'alpha.com', domainB: 'beta.com' }) });
    render(page as React.ReactElement);

    expect(screen.getByRole('heading', { name: 'alpha.com vs beta.com at a glance' })).toBeDefined();
    expect(screen.getByRole('link', { name: 'alpha.com' })).toBeDefined();
    expect(screen.getByRole('link', { name: 'beta.com' })).toBeDefined();
    expect(screen.getByText('Monthly Visits')).toBeDefined();
    expect(screen.getByText('Global Rank')).toBeDefined();
    expect(screen.getByText('Trust Score')).toBeDefined();
    expect(screen.getByText('Category')).toBeDefined();
    expect(screen.getByText('Tech Stack')).toBeDefined();
    expect(screen.getByText('Domain Age')).toBeDefined();
    expect(screen.getByText('Bounce Rate')).toBeDefined();
  });

  it('shows missing data warning when one report is null', async () => {
    vi.mocked(getSiteReport).mockResolvedValueOnce({
      report: makeReport({ domain: 'alpha.com' }),
      isStale: false,
      updatedAt: '2026-01-01',
    });
    vi.mocked(getSiteReport).mockResolvedValueOnce(null);

    const page = await ComparePage({ params: Promise.resolve({ domainA: 'alpha.com', domainB: 'beta.com' }) });
    render(page as React.ReactElement);

    expect(screen.getByText(/Report data is missing/)).toBeDefined();
  });

  it('calls notFound for same-domain comparisons', async () => {
    await ComparePage({ params: Promise.resolve({ domainA: 'same.com', domainB: 'same.com' }) });
    expect(notFound).toHaveBeenCalled();
  });


  it('renders analyst callouts and next moves when both reports exist', async () => {
    vi.mocked(getSiteReport).mockResolvedValueOnce({
      report: makeReport({ domain: 'alpha.com' }),
      isStale: false,
      updatedAt: '2026-01-01',
    });
    vi.mocked(getSiteReport).mockResolvedValueOnce({
      report: makeReport({ domain: 'beta.com', trafficData: { monthlyVisits: 300000, globalRank: 2000, bounceRate: 40, domainAgeYears: 5 } }),
      isStale: false,
      updatedAt: '2026-01-01',
    });

    const page = await ComparePage({ params: Promise.resolve({ domainA: 'alpha.com', domainB: 'beta.com' }) });
    render(page as React.ReactElement);

    expect(screen.getByText('Analyst comparison')).toBeDefined();
    expect(screen.getByText('Estimated traffic gap')).toBeDefined();
    expect(screen.getByText('Measured signal tally')).toBeDefined();
    expect(screen.getByText('Gap: 200.0K visits')).toBeDefined();
    expect(screen.getByText('5 measured signals')).toBeDefined();
    expect(screen.getByText('How to read this table')).toBeDefined();
    expect(screen.getByText('Measured highlights')).toBeDefined();
    expect(screen.getByText('Analyst next moves')).toBeDefined();
  });

  it('renders FAQ section', async () => {
    vi.mocked(getSiteReport).mockResolvedValueOnce({
      report: makeReport({ domain: 'alpha.com' }),
      isStale: false,
      updatedAt: '2026-01-01',
    });
    vi.mocked(getSiteReport).mockResolvedValueOnce({
      report: makeReport({ domain: 'beta.com' }),
      isStale: false,
      updatedAt: '2026-01-01',
    });

    const page = await ComparePage({ params: Promise.resolve({ domainA: 'alpha.com', domainB: 'beta.com' }) });
    render(page as React.ReactElement);

    expect(screen.getByText('Comparison FAQ')).toBeDefined();
    expect(screen.getByText(/How does alpha.com compare to beta.com/)).toBeDefined();
  });

  it('renders JSON-LD script tag', async () => {
    vi.mocked(getSiteReport).mockResolvedValueOnce({
      report: makeReport({ domain: 'alpha.com' }),
      isStale: false,
      updatedAt: '2026-01-01',
    });
    vi.mocked(getSiteReport).mockResolvedValueOnce({
      report: makeReport({ domain: 'beta.com' }),
      isStale: false,
      updatedAt: '2026-01-01',
    });

    const page = await ComparePage({ params: Promise.resolve({ domainA: 'alpha.com', domainB: 'beta.com' }) });
    const root = page as React.ReactElement<{ children: React.ReactNode }>;
    const children = React.Children.toArray(root.props.children);
    const scriptNode = children.find((child) => (
      React.isValidElement(child) && child.type === 'script'
    )) as React.ReactElement<{ dangerouslySetInnerHTML?: { __html?: string } }> | undefined;

    expect(scriptNode).toBeDefined();
    const jsonLdText = scriptNode?.props.dangerouslySetInnerHTML?.__html ?? '';
    expect(jsonLdText).toContain('alpha.com');
    expect(jsonLdText).toContain('beta.com');
  });

  it('normalizes and redirects non-alphabetical encoded domain params', async () => {
    vi.mocked(getSiteReport).mockResolvedValue({
      report: makeReport(),
      isStale: false,
      updatedAt: '2026-01-01',
    });

    await ComparePage({ params: Promise.resolve({ domainA: 'ZEBRA.COM', domainB: 'alpha.com' }) });

    expect(redirect).toHaveBeenCalledWith('/compare/alpha.com/vs/zebra.com');
  });
});

describe('generateMetadata', () => {
  it('returns compare metadata with canonical URL', async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ domainA: 'alpha.com', domainB: 'beta.com' }) });

    expect(metadata.title).toBe('alpha.com vs beta.com — Compare Website Traffic, SEO & Tech Stack');
    expect(metadata.alternates?.canonical).toBe('/compare/alpha.com/vs/beta.com');
  });

  it('returns noindex for empty domains', async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ domainA: '', domainB: '' }) });

    expect(metadata.robots).toEqual({ index: false });
  });

  it('returns noindex metadata when one report is missing', async () => {
    vi.mocked(getSiteReport).mockResolvedValueOnce({
      report: makeReport({ domain: 'alpha.com' }),
      isStale: false,
      updatedAt: '2026-01-01',
    });
    vi.mocked(getSiteReport).mockResolvedValueOnce(null);

    const metadata = await generateMetadata({ params: Promise.resolve({ domainA: 'alpha.com', domainB: 'beta.com' }) });

    expect(metadata.robots).toEqual({ index: false, follow: true });
    expect(metadata.alternates?.canonical).toBe('/compare/alpha.com/vs/beta.com');
  });

  it('returns noindex metadata when compare signals are too sparse', async () => {
    vi.mocked(getSiteReport).mockResolvedValueOnce({
      report: makeReport({ domain: 'alpha.com', trafficData: undefined, aiAnalysis: undefined, meta: undefined, taxonomy: undefined }),
      isStale: false,
      updatedAt: '2026-01-01',
    });
    vi.mocked(getSiteReport).mockResolvedValueOnce({
      report: makeReport({ domain: 'beta.com', trafficData: undefined, aiAnalysis: undefined, meta: undefined, taxonomy: undefined }),
      isStale: false,
      updatedAt: '2026-01-01',
    });

    const metadata = await generateMetadata({ params: Promise.resolve({ domainA: 'alpha.com', domainB: 'beta.com' }) });

    expect(metadata.robots).toEqual({ index: false, follow: true });
    expect(metadata.alternates?.canonical).toBe('/compare/alpha.com/vs/beta.com');
  });

  it('normalizes domain order in metadata', async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ domainA: 'zebra.com', domainB: 'alpha.com' }) });

    expect(metadata.title).toBe('alpha.com vs zebra.com — Compare Website Traffic, SEO & Tech Stack');
    expect(metadata.alternates?.canonical).toBe('/compare/alpha.com/vs/zebra.com');
  });
});
