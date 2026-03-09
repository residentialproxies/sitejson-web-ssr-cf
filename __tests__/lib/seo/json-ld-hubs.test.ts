import { describe, expect, it } from 'vitest';
import {
  generateDirectoryHubJsonLd,
  generateDirectoryPageJsonLd,
  generateDirectoryTypeHubJsonLd,
} from '@/lib/seo/json-ld';

describe('hub json-ld helpers', () => {
  it('builds directory hub schema graph', () => {
    const result = JSON.parse(generateDirectoryHubJsonLd()) as { '@graph': Array<{ '@type': string }> };
    expect(result['@graph'].map((item) => item['@type'])).toEqual(['WebPage', 'BreadcrumbList']);
  });

  it('builds directory type hub schema with FAQ', () => {
    const result = JSON.parse(generateDirectoryTypeHubJsonLd('technology', 'react')) as { '@graph': Array<{ '@type': string }> };
    expect(result['@graph'].map((item) => item['@type'])).toContain('FAQPage');
  });

  it('includes faq schema on detail pages when provided', () => {
    const result = JSON.parse(generateDirectoryPageJsonLd({
      type: 'technology',
      slug: 'react',
      faqs: [{ question: 'Q?', answer: 'A.' }],
    })) as { '@graph': Array<{ '@type': string }> };
    expect(result['@graph'].map((item) => item['@type'])).toContain('FAQPage');
  });
});
