import { describe, it, expect } from 'vitest';
import { buildCompareMetadata } from '@/lib/seo/metadata';

describe('buildCompareMetadata', () => {
  it('generates correct title for alphabetical domains', () => {
    const metadata = buildCompareMetadata('alpha.com', 'beta.com');
    expect(metadata.title).toBe('alpha.com vs beta.com — Compare Website Traffic, SEO & Tech Stack');
  });

  it('enforces alphabetical order regardless of input order', () => {
    const metadata = buildCompareMetadata('zebra.com', 'alpha.com');
    expect(metadata.title).toBe('alpha.com vs zebra.com — Compare Website Traffic, SEO & Tech Stack');
    expect(metadata.alternates?.canonical).toBe('/compare/alpha.com/vs/zebra.com');
  });

  it('has correct canonical URL', () => {
    const metadata = buildCompareMetadata('foo.com', 'bar.com');
    expect(metadata.alternates?.canonical).toBe('/compare/bar.com/vs/foo.com');
  });

  it('has correct description mentioning both domains', () => {
    const metadata = buildCompareMetadata('alpha.com', 'beta.com');
    expect(metadata.description).toContain('alpha.com');
    expect(metadata.description).toContain('beta.com');
    expect(metadata.description).toContain('traffic');
    expect(metadata.description).toContain('trust score');
  });

  it('has OpenGraph article type with correct fields', () => {
    const metadata = buildCompareMetadata('alpha.com', 'beta.com');
    expect(metadata.openGraph).toMatchObject({
      type: 'article',
      url: '/compare/alpha.com/vs/beta.com',
    });
    expect(metadata.openGraph?.title).toContain('SiteJSON');
    expect(metadata.openGraph).toHaveProperty('images');
  });

  it('has Twitter card configuration', () => {
    const metadata = buildCompareMetadata('alpha.com', 'beta.com');
    expect(metadata.twitter).toMatchObject({
      card: 'summary_large_image',
    });
    expect(metadata.twitter?.title).toContain('alpha.com vs beta.com');
    expect(metadata.twitter).toHaveProperty('images');
  });

  it('normalizes domain input', () => {
    const metadata = buildCompareMetadata(' HTTPS://Alpha.COM/path ', ' Beta.COM ');
    expect(metadata.title).toBe('alpha.com vs beta.com — Compare Website Traffic, SEO & Tech Stack');
    expect(metadata.alternates?.canonical).toBe('/compare/alpha.com/vs/beta.com');
  });
});
