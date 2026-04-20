import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DirectoryContent from '@/app/directory/[type]/[slug]/directory-content';
import { fetchDirectoryListing } from '@/services/api';

vi.mock('@/services/api', () => ({
  fetchDirectoryListing: vi.fn(),
}));

describe('DirectoryContent', () => {
  it('updates sidebar summaries and related links after filtering', async () => {
    vi.mocked(fetchDirectoryListing).mockResolvedValue({
      status: 'success',
      data: {
        items: [
          { domain: 'gamma.com', title: 'Gamma', rank: 800, monthlyVisits: 500000, legitimacyScore: 82, techStack: ['Next.js'], tags: ['payments'] },
          { domain: 'delta.com', title: 'Delta', rank: 1200, monthlyVisits: 320000, legitimacyScore: 76, techStack: ['React'], tags: ['fintech'] },
        ],
        page: 1,
        pageSize: 24,
        total: 2,
        totalPages: 1,
      },
    });

    render(
      <DirectoryContent
        mode="category"
        value="finance"
        initialListing={{
          items: [
            { domain: 'alpha.com', title: 'Alpha', rank: 100, monthlyVisits: 900000, legitimacyScore: 91, techStack: ['Vue'], tags: ['banking'] },
            { domain: 'beta.com', title: 'Beta', rank: 220, monthlyVisits: 700000, legitimacyScore: 88, techStack: ['Nuxt'], tags: ['lending'] },
          ],
          page: 1,
          pageSize: 24,
          total: 2,
          totalPages: 1,
        }}
        initialStatus="success"
        initialStats={{
          type: 'category',
          slug: 'finance',
          total: 2,
          avgLegitimacyScore: 90,
          trafficDistribution: { top10k: 2, top100k: 0, top1m: 0, unranked: 0 },
          topTechnologies: [{ name: 'Vue', count: 1 }],
          topTags: [{ name: 'banking', count: 1 }],
          topCountries: [{ country: 'United States', count: 2 }],
          hasTrafficData: 2,
        }}
      />,
    );

    expect(screen.getByText(/alpha.com and beta.com are the quickest live reports/i)).toBeDefined();

    await userEvent.click(screen.getByRole('button', { name: 'By traffic' }));

    await waitFor(() => {
      expect(fetchDirectoryListing).toHaveBeenCalledWith('category', 'finance', 1, 24, {
        sort: 'traffic',
        minScore: undefined,
        hasTraffic: undefined,
      });
    });

    await waitFor(() => {
      expect(screen.getByText(/gamma.com and delta.com are the quickest live reports/i)).toBeDefined();
    });

    expect(screen.getByText(/Start with gamma.com/i)).toBeDefined();
  });

  it('keeps prior results visible when a filtered fetch fails', async () => {
    vi.mocked(fetchDirectoryListing).mockResolvedValue({
      status: 'unavailable',
      data: null,
      message: 'Directory data is temporarily unavailable.',
    });

    render(
      <DirectoryContent
        mode="category"
        value="finance"
        initialListing={{
          items: [
            { domain: 'alpha.com', title: 'Alpha', rank: 100, monthlyVisits: 900000, legitimacyScore: 91, techStack: ['Vue'], tags: ['banking'] },
          ],
          page: 1,
          pageSize: 24,
          total: 1,
          totalPages: 1,
        }}
        initialStatus="success"
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'By traffic' }));

    await waitFor(() => {
      expect(screen.getByText(/Directory data is temporarily unavailable/i)).toBeInTheDocument();
    });

    expect(screen.getAllByText('alpha.com')).toHaveLength(2);
    expect(screen.queryByText(/No indexed sites yet/i)).not.toBeInTheDocument();
  });
});
