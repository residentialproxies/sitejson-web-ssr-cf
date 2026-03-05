import { describe, it, expect } from 'vitest';
import {
  generateOrganizationJsonLd,
  generateWebSiteJsonLd,
  generateWebPageJsonLd,
  generateBreadcrumbJsonLd,
  generateDatasetJsonLd,
  generateFAQJsonLd,
  generateSoftwareApplicationJsonLd,
  combineJsonLd,
  generateHomepageJsonLd,
  generateDataPageJsonLd,
  generateDirectoryPageJsonLd,
} from '@/lib/seo/json-ld';
import type { SiteReport } from '@/lib/api-client/types';

const BASE = 'https://sitejson.com';

describe('JSON-LD generators', () => {
  describe('generateOrganizationJsonLd', () => {
    it('produces valid Organization schema', () => {
      const result = generateOrganizationJsonLd();
      expect(result['@context']).toBe('https://schema.org');
      expect(result['@type']).toBe('Organization');
      expect(result.name).toBe('SiteJSON');
      expect(result.url).toBe(BASE);
      expect(result.logo).toContain('icon-192x192');
    });
  });

  describe('generateWebSiteJsonLd', () => {
    it('produces valid WebSite schema with SearchAction', () => {
      const result = generateWebSiteJsonLd();
      expect(result['@type']).toBe('WebSite');
      expect(result.potentialAction).toBeDefined();
      expect(result.potentialAction!['@type']).toBe('SearchAction');
      expect(result.potentialAction!.target).toContain('{search_term_string}');
    });
  });

  describe('generateWebPageJsonLd', () => {
    it('builds WebPage with title, description, URL', () => {
      const result = generateWebPageJsonLd('Test Page', 'A test', '/test');
      expect(result['@type']).toBe('WebPage');
      expect(result.name).toBe('Test Page');
      expect(result.description).toBe('A test');
      expect(result.url).toBe(`${BASE}/test`);
    });

    it('includes dateModified when provided', () => {
      const result = generateWebPageJsonLd('P', 'D', '/x', '2026-01-01');
      expect(result.dateModified).toBe('2026-01-01');
    });

    it('omits dateModified when not provided', () => {
      const result = generateWebPageJsonLd('P', 'D', '/x');
      expect(result.dateModified).toBeUndefined();
    });
  });

  describe('generateBreadcrumbJsonLd', () => {
    it('builds breadcrumb list with correct positions', () => {
      const result = generateBreadcrumbJsonLd([
        { name: 'Home', path: '/' },
        { name: 'Data', path: '/data' },
        { name: 'google.com' },
      ]);
      expect(result['@type']).toBe('BreadcrumbList');
      expect(result.itemListElement).toHaveLength(3);
      expect(result.itemListElement[0].position).toBe(1);
      expect(result.itemListElement[1].position).toBe(2);
      expect(result.itemListElement[2].position).toBe(3);
      expect(result.itemListElement[0].item).toBe(`${BASE}/`);
    });

    it('omits breadcrumb item URL when path is not provided', () => {
      const result = generateBreadcrumbJsonLd([{ name: 'Current' }]);
      expect(result.itemListElement[0].item).toBeUndefined();
    });
  });

  describe('generateDatasetJsonLd', () => {
    const report: SiteReport = {
      domain: 'example.com',
      updatedAt: '2026-01-15T00:00:00Z',
      seo: { h1Count: 1, h2Count: 2, internalLinks: 5, externalLinks: 1, imagesCount: 3 },
      trafficData: { monthlyVisits: 1000, globalRank: 500 },
      dns: { provider: 'cloudflare', mxRecords: [], nsRecords: [], txtRecords: [] },
    };

    it('builds dataset with metrics from available providers', () => {
      const result = generateDatasetJsonLd('example.com', report);
      expect(result['@type']).toBe('Dataset');
      expect(result.name).toContain('example.com');
      expect(result.variableMeasured).toContain('SEO Score');
      expect(result.variableMeasured).toContain('Traffic Volume');
      expect(result.variableMeasured).toContain('DNS Configuration');
      expect(result.dateModified).toBe('2026-01-15T00:00:00Z');
    });

    it('returns empty metrics for empty report', () => {
      const emptyReport: SiteReport = { domain: 'empty.com', updatedAt: '2026-01-01' };
      const result = generateDatasetJsonLd('empty.com', emptyReport);
      expect(result.variableMeasured).toEqual([]);
    });

    it('normalizes protocol/path domain input in dataset URL and name', () => {
      const result = generateDatasetJsonLd(' https://Example.com/path ', report);
      expect(result.name).toBe('example.com Website Intelligence Report');
      expect(result.url).toBe(`${BASE}/data/example.com`);
    });
  });

  describe('generateFAQJsonLd', () => {
    it('builds FAQ with Question/Answer pairs', () => {
      const result = generateFAQJsonLd([
        { question: 'Q1?', answer: 'A1.' },
        { question: 'Q2?', answer: 'A2.' },
      ]);
      expect(result['@type']).toBe('FAQPage');
      expect(result.mainEntity).toHaveLength(2);
      expect(result.mainEntity[0]['@type']).toBe('Question');
      expect(result.mainEntity[0].acceptedAnswer['@type']).toBe('Answer');
      expect(result.mainEntity[0].name).toBe('Q1?');
      expect(result.mainEntity[0].acceptedAnswer.text).toBe('A1.');
    });
  });

  describe('generateSoftwareApplicationJsonLd', () => {
    it('produces SoftwareApplication without aggregateRating', () => {
      const result = generateSoftwareApplicationJsonLd();
      expect(result['@type']).toBe('SoftwareApplication');
      expect(result.offers.price).toBe('0');
      expect(result.aggregateRating).toBeUndefined();
    });
  });

  describe('combineJsonLd', () => {
    it('returns single object JSON for one item', () => {
      const single = { '@context': 'https://schema.org', '@type': 'WebSite' };
      const result = JSON.parse(combineJsonLd([single]));
      expect(result['@type']).toBe('WebSite');
      expect(result['@graph']).toBeUndefined();
    });

    it('wraps multiple items in @graph', () => {
      const items = [
        { '@context': 'https://schema.org', '@type': 'WebSite' },
        { '@context': 'https://schema.org', '@type': 'Organization' },
      ];
      const result = JSON.parse(combineJsonLd(items));
      expect(result['@graph']).toHaveLength(2);
    });

    it('produces valid JSON', () => {
      const result = combineJsonLd([generateOrganizationJsonLd(), generateWebSiteJsonLd()]);
      expect(() => JSON.parse(result)).not.toThrow();
    });

    it('filters nullish entries from graph payload', () => {
      const result = JSON.parse(combineJsonLd([
        generateOrganizationJsonLd(),
        null,
        undefined,
        generateWebSiteJsonLd(),
      ]));

      expect(result['@graph']).toHaveLength(2);
    });
  });

  describe('generateHomepageJsonLd', () => {
    it('produces valid combined JSON-LD string', () => {
      const result = generateHomepageJsonLd();
      const parsed = JSON.parse(result);
      expect(parsed['@graph']).toBeDefined();
      const types = parsed['@graph'].map((item: { '@type': string }) => item['@type']);
      expect(types).toContain('Organization');
      expect(types).toContain('WebSite');
      expect(types).toContain('WebPage');
      expect(types).toContain('SoftwareApplication');
      expect(types).toContain('FAQPage');
    });
  });

  describe('generateDataPageJsonLd', () => {
    const report: SiteReport = { domain: 'test.com', updatedAt: '2026-01-01' };

    it('produces combined JSON-LD for data page', () => {
      const result = generateDataPageJsonLd({ domain: 'test.com', report });
      const parsed = JSON.parse(result);
      expect(parsed['@graph']).toHaveLength(3); // WebPage + Breadcrumb + Dataset
    });

    it('includes subPage in breadcrumb', () => {
      const result = generateDataPageJsonLd({ domain: 'test.com', report, subPage: 'traffic' });
      const parsed = JSON.parse(result);
      const breadcrumb = parsed['@graph'].find((i: { '@type': string }) => i['@type'] === 'BreadcrumbList');
      expect(breadcrumb.itemListElement).toHaveLength(3);
      expect(breadcrumb.itemListElement[2].name).toBe('Traffic');
    });

    it('normalizes domain in URLs and dataset name', () => {
      const result = generateDataPageJsonLd({ domain: ' Example.COM ', report });
      const parsed = JSON.parse(result);
      const webpage = parsed['@graph'].find((i: { '@type': string }) => i['@type'] === 'WebPage');
      const dataset = parsed['@graph'].find((i: { '@type': string }) => i['@type'] === 'Dataset');

      expect(webpage.url).toBe(`${BASE}/data/example.com`);
      expect(dataset.name).toBe('example.com Website Intelligence Report');
    });

    it('normalizes protocol/path domain input in data page schema URLs', () => {
      const result = generateDataPageJsonLd({ domain: ' https://Blog.SiteJson.com/path ', report });
      const parsed = JSON.parse(result);
      const webpage = parsed['@graph'].find((i: { '@type': string }) => i['@type'] === 'WebPage');
      const breadcrumb = parsed['@graph'].find((i: { '@type': string }) => i['@type'] === 'BreadcrumbList');

      expect(webpage.url).toBe(`${BASE}/data/blog.sitejson.com`);
      expect(breadcrumb.itemListElement[1].name).toBe('blog.sitejson.com');
      expect(breadcrumb.itemListElement[1].item).toBe(`${BASE}/data/blog.sitejson.com`);
    });
  });

  describe('generateDirectoryPageJsonLd', () => {
    it('produces combined JSON-LD for directory page', () => {
      const result = generateDirectoryPageJsonLd({ type: 'technology', slug: 'react' });
      const parsed = JSON.parse(result);
      expect(parsed['@graph']).toHaveLength(2); // WebPage + Breadcrumb
      const webpage = parsed['@graph'].find((i: { '@type': string }) => i['@type'] === 'WebPage');
      expect(webpage.name).toContain('React');
      expect(webpage.url).toContain('/directory/technology/react');
    });

    it('breadcrumb has 4 levels', () => {
      const result = generateDirectoryPageJsonLd({ type: 'category', slug: 'finance' });
      const parsed = JSON.parse(result);
      const breadcrumb = parsed['@graph'].find((i: { '@type': string }) => i['@type'] === 'BreadcrumbList');
      expect(breadcrumb.itemListElement).toHaveLength(4);
    });

    it('normalizes slug input and keeps terminal breadcrumb item without URL', () => {
      const result = generateDirectoryPageJsonLd({ type: 'technology', slug: 'Next.js' });
      const parsed = JSON.parse(result);
      const webpage = parsed['@graph'].find((i: { '@type': string }) => i['@type'] === 'WebPage');
      const breadcrumb = parsed['@graph'].find((i: { '@type': string }) => i['@type'] === 'BreadcrumbList');
      const lastItem = breadcrumb.itemListElement[breadcrumb.itemListElement.length - 1];

      expect(webpage.url).toBe(`${BASE}/directory/technology/nextjs`);
      expect(lastItem.name).toBe('Nextjs');
      expect(lastItem.item).toBeUndefined();
    });
  });
});
