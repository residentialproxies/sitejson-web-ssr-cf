import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DirectoryClusterTakeaways } from '@/components/directory/DirectoryClusterTakeaways';

describe('DirectoryClusterTakeaways', () => {
  it('renders derived takeaways from items and stats', () => {
    render(
      <DirectoryClusterTakeaways
        label="Finance"
        items={[
          { domain: 'alpha.com', title: 'Alpha' },
          { domain: 'beta.com', title: 'Beta' },
        ]}
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

    expect(screen.getByText('Cluster takeaways')).toBeDefined();
    expect(screen.getByText('Fastest representative example')).toBeDefined();
    expect(screen.getByText(/alpha.com and beta.com/)).toBeDefined();
    expect(screen.getByText('Trust baseline')).toBeDefined();
    expect(screen.getByText(/strong quality posture/i)).toBeDefined();
    expect(screen.getByText(/moderate coverage/i)).toBeDefined();
    expect(screen.getByText(/moderate recurring technology signal/i)).toBeDefined();
  });
});
