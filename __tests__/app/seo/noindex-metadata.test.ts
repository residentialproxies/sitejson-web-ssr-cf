import { describe, expect, it } from 'vitest';
import { metadata as dashboardMetadata } from '@/app/dashboard/page';
import { metadata as notFoundMetadata } from '@/app/not-found';

describe('noindex metadata', () => {
  it('marks the framework 404 page as non-indexable', () => {
    expect(notFoundMetadata.title).toEqual({
      absolute: 'Page Not Found | SiteJSON',
    });
    expect(notFoundMetadata.robots).toBeUndefined();
  });

  it('marks the authenticated dashboard page as non-indexable', () => {
    expect(dashboardMetadata.robots).toMatchObject({
      index: false,
      follow: false,
    });
  });
});
