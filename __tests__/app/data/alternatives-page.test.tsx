import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { getSiteAlternatives } from '@/lib/api-client/client';
import AlternativesPage, { generateMetadata } from '@/app/data/[domain]/alternatives/page';

vi.mock('@/lib/api-client/client', () => ({
  getSiteAlternatives: vi.fn(),
}));

describe('AlternativesPage', () => {
  it('renders empty state when no alternatives found', async () => {
    vi.mocked(getSiteAlternatives).mockResolvedValueOnce(null);

    const ui = await AlternativesPage({ params: Promise.resolve({ domain: 'example.com' }) });
    render(ui);

    expect(screen.getByText('No alternatives found')).toBeInTheDocument();
    expect(screen.getByText(/No alternative or competing websites/)).toBeInTheDocument();
  });

  it('renders alternatives grid when data is available', async () => {
    vi.mocked(getSiteAlternatives).mockResolvedValueOnce({
      algorithm: 'v1',
      items: [
        { domain: 'alt1.com', title: 'Alt One', rank: 100, score: 85, reasons: ['Same category'] },
        { domain: 'alt2.com', rank: 200, score: 70 },
        { domain: 'alt3.com', reasons: ['Similar tech'] },
      ],
    });

    const ui = await AlternativesPage({ params: Promise.resolve({ domain: 'example.com' }) });
    render(ui);

    expect(screen.getByText('alt1.com')).toBeInTheDocument();
    expect(screen.getByText('alt2.com')).toBeInTheDocument();
    expect(screen.getByText('alt3.com')).toBeInTheDocument();
    expect(screen.getByText('Alt One')).toBeInTheDocument();
    expect(screen.getByText('85/100')).toBeInTheDocument();
    expect(screen.getByText('Same category')).toBeInTheDocument();
    expect(screen.getByText('Similar tech')).toBeInTheDocument();
  });

  it('links each alternative card to its data page', async () => {
    vi.mocked(getSiteAlternatives).mockResolvedValueOnce({
      algorithm: 'v1',
      items: [
        { domain: 'linked.com' },
      ],
    });

    const ui = await AlternativesPage({ params: Promise.resolve({ domain: 'example.com' }) });
    render(ui);

    const link = screen.getByRole('link', { name: /linked\.com/i });
    expect(link).toHaveAttribute('href', '/data/linked.com');
  });

  it('renders FAQ section', async () => {
    vi.mocked(getSiteAlternatives).mockResolvedValueOnce({
      algorithm: 'v1',
      items: [],
    });

    const ui = await AlternativesPage({ params: Promise.resolve({ domain: 'example.com' }) });
    render(ui);

    expect(screen.getByText(/best alternatives to example\.com/i)).toBeInTheDocument();
  });

  it('renders section guide', async () => {
    vi.mocked(getSiteAlternatives).mockResolvedValueOnce({
      algorithm: 'v1',
      items: [],
    });

    const ui = await AlternativesPage({ params: Promise.resolve({ domain: 'example.com' }) });
    render(ui);

    expect(screen.getByText('Use alternatives to map the competitive landscape')).toBeInTheDocument();
  });

  it('marks alternatives metadata as noindex below the threshold', async () => {
    vi.mocked(getSiteAlternatives).mockResolvedValueOnce({
      algorithm: 'v1',
      items: [{ domain: 'alt1.com' }, { domain: 'alt2.com' }],
    });

    const metadata = await generateMetadata({ params: Promise.resolve({ domain: 'example.com' }) });

    expect(metadata.robots).toEqual({
      index: false,
      follow: true,
    });
  });

  it('marks alternatives metadata as indexable when enough alternatives exist', async () => {
    vi.mocked(getSiteAlternatives).mockResolvedValueOnce({
      algorithm: 'v1',
      items: [{ domain: 'alt1.com' }, { domain: 'alt2.com' }, { domain: 'alt3.com' }],
    });

    const metadata = await generateMetadata({ params: Promise.resolve({ domain: 'example.com' }) });

    expect(metadata.robots).toEqual({
      index: true,
      follow: true,
    });
  });
});
