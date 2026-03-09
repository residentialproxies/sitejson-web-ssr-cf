import { describe, expect, it } from 'vitest';
import {
  buildDirectoryHubMetadata,
  buildDirectoryMetadata,
  buildDirectoryTypeHubMetadata,
  buildHomeMetadata,
  buildInsightsMetadata,
  buildPaginatedDirectoryMetadata,
} from '@/lib/seo/metadata';

describe('hub metadata helpers', () => {
  it('builds homepage metadata with canonical root', () => {
    const metadata = buildHomeMetadata();
    expect(metadata.alternates?.canonical).toBe('/');
    expect(metadata.title).toBe('Compare Websites, Traffic, SEO & Tech Stack Data');
  });

  it('builds insights metadata', () => {
    const metadata = buildInsightsMetadata();
    expect(metadata.alternates?.canonical).toBe('/insights');
    expect(metadata.title).toBe('Global Website Insights');
  });

  it('builds directory hub metadata', () => {
    const metadata = buildDirectoryHubMetadata();
    expect(metadata.alternates?.canonical).toBe('/directory');
    expect(metadata.title).toBe('Website Directory Hub');
  });

  it('builds directory type hub metadata', () => {
    const metadata = buildDirectoryTypeHubMetadata('topic');
    expect(metadata.alternates?.canonical).toBe('/directory/topic');
    expect(metadata.title).toBe('Topic Directory Hub');
  });

  it('allows noindex directory detail metadata', () => {
    const metadata = buildDirectoryMetadata('technology', 'react', { index: false });
    expect(metadata.robots).toMatchObject({ index: false, follow: true });
  });

  it('builds paginated directory metadata with page number in title', () => {
    const metadata = buildPaginatedDirectoryMetadata('category', 'marketing', 3, 5);
    expect(metadata.title).toBe('Top Marketing Websites — Page 3');
  });

  it('builds paginated directory metadata with correct canonical', () => {
    const metadata = buildPaginatedDirectoryMetadata('category', 'marketing', 3, 5);
    const alternates = metadata.alternates as Record<string, string>;
    expect(alternates.canonical).toBe('/directory/category/marketing/page/3');
  });

  it('sets prev alternate to canonical for page 2', () => {
    const metadata = buildPaginatedDirectoryMetadata('category', 'marketing', 2, 5);
    const alternates = metadata.alternates as Record<string, string>;
    expect(alternates.prev).toBe('/directory/category/marketing');
    expect(alternates.next).toBe('/directory/category/marketing/page/3');
  });

  it('sets prev alternate to page N-1 for page 3+', () => {
    const metadata = buildPaginatedDirectoryMetadata('category', 'marketing', 4, 5);
    const alternates = metadata.alternates as Record<string, string>;
    expect(alternates.prev).toBe('/directory/category/marketing/page/3');
  });

  it('omits next alternate on the last page', () => {
    const metadata = buildPaginatedDirectoryMetadata('category', 'marketing', 5, 5);
    const alternates = metadata.alternates as Record<string, string>;
    expect(alternates.next).toBeUndefined();
  });
});
