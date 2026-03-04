import { describe, it, expect } from 'vitest';
import type { Metadata } from 'next';
import {
  buildBaseMetadata,
  buildReportMetadata,
  buildSitePageMetadata,
  buildDataSubPageMetadata,
  buildDirectoryMetadata,
} from '@/lib/seo/metadata';

describe('buildBaseMetadata', () => {
  it('should return base metadata with correct structure', () => {
    const metadata = buildBaseMetadata();

    expect(metadata).toHaveProperty('metadataBase');
    expect(metadata).toHaveProperty('title');
    expect(metadata).toHaveProperty('description');
    expect(metadata).toHaveProperty('icons');
    expect(metadata).toHaveProperty('openGraph');
    expect(metadata).toHaveProperty('twitter');
    expect(metadata).toHaveProperty('robots');
    expect(metadata).toHaveProperty('keywords');
  });

  it('should have correct default title', () => {
    const metadata = buildBaseMetadata();
    expect(metadata.title).toEqual({
      default: 'SiteJSON — Website Intelligence, Structured Data',
      template: '%s | SiteJSON',
    });
  });

  it('should have correct description', () => {
    const metadata = buildBaseMetadata();
    expect(metadata.description).toContain('Website intelligence API');
    expect(metadata.description).toContain('traffic estimates');
  });

  it('should have correct icons configuration', () => {
    const metadata = buildBaseMetadata();
    expect(metadata.icons).toHaveProperty('icon');
    expect(metadata.icons).toHaveProperty('shortcut');
    expect(metadata.icons).toHaveProperty('apple');
    expect(metadata.icons).toHaveProperty('other');
  });

  it('should have correct OpenGraph configuration', () => {
    const metadata = buildBaseMetadata();
    expect(metadata.openGraph).toMatchObject({
      type: 'website',
      siteName: 'SiteJSON',
      title: 'SiteJSON — Website Intelligence, Structured Data',
    });
    expect(metadata.openGraph).toHaveProperty('images');
    expect(metadata.openGraph).toHaveProperty('locale', 'en_US');
  });

  it('should use non-404 OG endpoint for default social image', () => {
    const metadata = buildBaseMetadata();
    const ogImages = metadata.openGraph?.images as Array<{ url?: string | URL }> | undefined;
    const imageUrl = ogImages?.[0]?.url?.toString();

    expect(imageUrl).toContain('/api/og');
    expect(imageUrl).not.toContain('/og-image.png');
  });

  it('should have correct Twitter configuration', () => {
    const metadata = buildBaseMetadata();
    expect(metadata.twitter).toMatchObject({
      card: 'summary_large_image',
      site: '@sitejson',
      creator: '@sitejson',
      title: 'SiteJSON — Website Intelligence, Structured Data',
    });
    expect(metadata.twitter).toHaveProperty('images');
  });

  it('should have correct robots configuration', () => {
    const metadata = buildBaseMetadata();
    expect(metadata.robots).toMatchObject({
      index: true,
      follow: true,
    });
    expect(metadata.robots).toHaveProperty('googleBot');
  });

  it('should have keywords', () => {
    const metadata = buildBaseMetadata();
    expect(metadata.keywords).toContain('website intelligence');
    expect(metadata.keywords).toContain('SEO analysis');
  });
});

describe('buildReportMetadata', () => {
  it('should generate metadata for a domain report', () => {
    const domain = 'example.com';
    const metadata = buildReportMetadata(domain);

    expect(metadata.title).toBe('example.com Website Intelligence Report');
    expect(metadata.description).toContain('example.com');
    expect(metadata.description).toContain('Comprehensive analysis');
  });

  it('should include score and traffic data when provided', () => {
    const domain = 'example.com';
    const data = { score: 85, traffic: 5000000 };
    const metadata = buildReportMetadata(domain, data);

    expect(metadata.description).toContain('trust score 85');
    expect(metadata.description).toContain('5.0M monthly visits');
  });

  it('should have correct canonical URL', () => {
    const domain = 'test.com';
    const metadata = buildReportMetadata(domain);

    expect(metadata.alternates).toEqual({
      canonical: '/data/test.com',
    });
  });

  it('should have correct OpenGraph for article type', () => {
    const domain = 'example.com';
    const metadata = buildReportMetadata(domain);

    expect(metadata.openGraph).toMatchObject({
      title: 'example.com Website Intelligence Report | SiteJSON',
      url: '/data/example.com',
      type: 'article',
    });
    expect(metadata.openGraph).toHaveProperty('images');
  });

  it('should have correct Twitter card', () => {
    const domain = 'example.com';
    const metadata = buildReportMetadata(domain);

    expect(metadata.twitter).toMatchObject({
      card: 'summary_large_image',
      title: 'example.com Website Intelligence Report | SiteJSON',
    });
    expect(metadata.twitter).toHaveProperty('images');
  });
});

describe('buildSitePageMetadata', () => {
  it('should generate metadata for site analysis page', () => {
    const domain = 'example.com';
    const metadata = buildSitePageMetadata(domain);

    expect(metadata.title).toBe('Analyzing example.com');
    expect(metadata.description).toContain('example.com');
    expect(metadata.description).toContain('Live analysis');
  });

  it('should have robots noindex', () => {
    const metadata = buildSitePageMetadata('example.com');

    expect(metadata.robots).toEqual({
      index: false,
      follow: true,
    });
  });

  it('should have canonical pointing to data page', () => {
    const domain = 'test.com';
    const metadata = buildSitePageMetadata(domain);

    expect(metadata.alternates).toEqual({
      canonical: '/data/test.com',
    });
  });
});

describe('buildDataSubPageMetadata', () => {
  const testCases: Array<{ subPage: 'traffic' | 'seo' | 'tech' | 'business'; expectedTitle: string }> = [
    { subPage: 'traffic', expectedTitle: 'Traffic Statistics & Analytics' },
    { subPage: 'seo', expectedTitle: 'SEO Analysis & Score' },
    { subPage: 'tech', expectedTitle: 'Technology Stack & Infrastructure' },
    { subPage: 'business', expectedTitle: 'Business Intelligence & Trust' },
  ];

  testCases.forEach(({ subPage, expectedTitle }) => {
    it(`should generate correct metadata for ${subPage} subpage`, () => {
      const domain = 'example.com';
      const metadata = buildDataSubPageMetadata(domain, subPage);

      expect(metadata.title).toBe(`${domain} ${expectedTitle}`);
      expect(metadata.description).toBeTruthy();
      expect(metadata.alternates?.canonical).toBe(`/data/${domain}/${subPage}`);
    });
  });

  it('should have correct OpenGraph for each subpage', () => {
    const domain = 'example.com';
    const subPage = 'traffic';
    const metadata = buildDataSubPageMetadata(domain, subPage);

    expect(metadata.openGraph).toMatchObject({
      title: 'example.com Traffic Statistics & Analytics | SiteJSON',
      url: '/data/example.com/traffic',
      type: 'article',
    });
    expect(metadata.openGraph).toHaveProperty('images');
  });

  it('should have Twitter summary_large_image card for subpages', () => {
    const domain = 'example.com';
    const subPage = 'seo';
    const metadata = buildDataSubPageMetadata(domain, subPage);

    expect(metadata.twitter).toMatchObject({
      card: 'summary_large_image',
      title: 'example.com SEO Analysis & Score | SiteJSON',
    });
    expect(metadata.twitter).toHaveProperty('images');
  });

  it('should have OG images for each subpage type', () => {
    const domain = 'example.com';
    const types: Array<'traffic' | 'seo' | 'tech' | 'business'> = ['traffic', 'seo', 'tech', 'business'];

    types.forEach((type) => {
      const metadata = buildDataSubPageMetadata(domain, type);
      expect(metadata.openGraph).toHaveProperty('images');
      expect(metadata.twitter).toHaveProperty('images');
    });
  });
});

describe('buildDirectoryMetadata', () => {
  it('should generate metadata for technology directory', () => {
    const metadata = buildDirectoryMetadata('technology', 'react');

    expect(metadata.title).toBe('Top React Websites — Technology Directory');
    expect(metadata.description).toContain('React');
    expect(metadata.description).toContain('built with');
  });

  it('should generate metadata for category directory', () => {
    const metadata = buildDirectoryMetadata('category', 'ecommerce');

    expect(metadata.title).toBe('Top Ecommerce Websites — Category Directory');
    expect(metadata.description).toContain('Ecommerce');
    expect(metadata.description).toContain('in');
  });

  it('should capitalize the slug in title', () => {
    const metadata = buildDirectoryMetadata('technology', 'nextjs');
    expect(metadata.title).toBe('Top Nextjs Websites — Technology Directory');
  });

  it('should have correct canonical URL', () => {
    const metadata = buildDirectoryMetadata('technology', 'react');
    expect(metadata.alternates).toEqual({
      canonical: '/directory/technology/react',
    });
  });

  it('should have correct OpenGraph configuration', () => {
    const metadata = buildDirectoryMetadata('technology', 'vue');

    expect(metadata.openGraph).toMatchObject({
      title: 'Top Vue Websites — Technology Directory | SiteJSON',
      url: '/directory/technology/vue',
      type: 'website',
    });
    expect(metadata.openGraph).toHaveProperty('images');
  });

  it('should have correct Twitter configuration', () => {
    const metadata = buildDirectoryMetadata('category', 'news');

    expect(metadata.twitter).toMatchObject({
      card: 'summary_large_image',
      title: 'Top News Websites | SiteJSON',
    });
    expect(metadata.twitter).toHaveProperty('images');
  });
});
