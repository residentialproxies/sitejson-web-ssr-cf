import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DirectoryStatsPanel } from '@/components/directory/DirectoryStatsPanel';

describe('DirectoryStatsPanel', () => {
  it('renders confidence-oriented coverage and quality wording', () => {
    render(
      <DirectoryStatsPanel
        stats={{
          type: 'category',
          slug: 'finance',
          total: 120,
          avgLegitimacyScore: 74,
          trafficDistribution: { top10k: 1, top100k: 4, top1m: 20, unranked: 95 },
          topTechnologies: [{ name: 'Next.js', count: 20 }],
          topTags: [{ name: 'payments', count: 18 }],
          topCountries: [{ country: 'United States', count: 30 }],
          hasTrafficData: 42,
        }}
      />,
    );

    expect(screen.getByText(/moderate coverage for prioritization/i)).toBeDefined();
    expect(screen.getByText(/strong quality posture/i)).toBeDefined();
    expect(screen.getByText(/detected technology signals in this filtered cluster/i)).toBeDefined();
    expect(screen.getByText(/detected topical signals in this filtered cluster/i)).toBeDefined();
  });
});
