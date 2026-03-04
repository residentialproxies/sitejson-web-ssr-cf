import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { getSiteReport } from '@/lib/api-client/client';
import OverviewPage from '@/app/data/[domain]/page';
import TechPage from '@/app/data/[domain]/tech/page';
import SeoPage from '@/app/data/[domain]/seo/page';
import TrafficPage from '@/app/data/[domain]/traffic/page';
import BusinessPage from '@/app/data/[domain]/business/page';

vi.mock('@/lib/api-client/client', () => ({
  getSiteReport: vi.fn(),
}));

const pages = [
  { label: 'overview', Page: OverviewPage },
  { label: 'technology', Page: TechPage },
  { label: 'SEO', Page: SeoPage },
  { label: 'traffic', Page: TrafficPage },
  { label: 'business', Page: BusinessPage },
] as const;

describe('domain data pages empty-state fallback', () => {
  it.each(pages)('renders consistent fallback for $label page when report is missing', async ({ label, Page }) => {
    vi.mocked(getSiteReport).mockResolvedValueOnce(null);

    const ui = await Page({ params: Promise.resolve({ domain: 'example.com' }) });
    render(ui);

    expect(screen.getByText('Report temporarily unavailable')).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`couldn't load the ${label} data`, 'i'))).toBeInTheDocument();

    const analyzeLink = screen.getByRole('link', { name: /Analyze example.com/i });
    expect(analyzeLink).toHaveAttribute('href', '/site/example.com');
  });
});
