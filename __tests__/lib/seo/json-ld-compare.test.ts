import { describe, it, expect } from 'vitest';
import { generateComparePageJsonLd } from '@/lib/seo/json-ld';

const BASE = 'https://sitejson.com';

describe('generateComparePageJsonLd', () => {
  it('produces combined JSON-LD with WebPage and BreadcrumbList', () => {
    const result = generateComparePageJsonLd('alpha.com', 'beta.com');
    const parsed = JSON.parse(result);

    expect(parsed['@graph']).toHaveLength(2);
    const types = parsed['@graph'].map((item: { '@type': string }) => item['@type']);
    expect(types).toContain('WebPage');
    expect(types).toContain('BreadcrumbList');
  });

  it('WebPage has correct title and URL', () => {
    const result = generateComparePageJsonLd('alpha.com', 'beta.com');
    const parsed = JSON.parse(result);
    const webpage = parsed['@graph'].find((i: { '@type': string }) => i['@type'] === 'WebPage');

    expect(webpage.name).toBe('alpha.com vs beta.com — Website Comparison');
    expect(webpage.url).toBe(`${BASE}/compare/alpha.com/vs/beta.com`);
  });

  it('enforces alphabetical domain order', () => {
    const result = generateComparePageJsonLd('zebra.com', 'alpha.com');
    const parsed = JSON.parse(result);
    const webpage = parsed['@graph'].find((i: { '@type': string }) => i['@type'] === 'WebPage');

    expect(webpage.name).toBe('alpha.com vs zebra.com — Website Comparison');
    expect(webpage.url).toBe(`${BASE}/compare/alpha.com/vs/zebra.com`);
  });

  it('breadcrumb has 3 levels: Home > Compare > A vs B', () => {
    const result = generateComparePageJsonLd('alpha.com', 'beta.com');
    const parsed = JSON.parse(result);
    const breadcrumb = parsed['@graph'].find((i: { '@type': string }) => i['@type'] === 'BreadcrumbList');

    expect(breadcrumb.itemListElement).toHaveLength(3);
    expect(breadcrumb.itemListElement[0].name).toBe('Home');
    expect(breadcrumb.itemListElement[0].item).toBe(`${BASE}/`);
    expect(breadcrumb.itemListElement[1].name).toBe('Compare');
    expect(breadcrumb.itemListElement[1].item).toBeUndefined();
    expect(breadcrumb.itemListElement[2].name).toBe('alpha.com vs beta.com');
    expect(breadcrumb.itemListElement[2].item).toBeUndefined();
  });

  it('normalizes domain input in URLs', () => {
    const result = generateComparePageJsonLd(' HTTPS://Alpha.COM/path ', ' Beta.COM ');
    const parsed = JSON.parse(result);
    const webpage = parsed['@graph'].find((i: { '@type': string }) => i['@type'] === 'WebPage');

    expect(webpage.url).toBe(`${BASE}/compare/alpha.com/vs/beta.com`);
  });

  it('produces valid JSON', () => {
    const result = generateComparePageJsonLd('foo.com', 'bar.com');
    expect(() => JSON.parse(result)).not.toThrow();
  });
});
