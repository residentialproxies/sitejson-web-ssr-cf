import type { AlternativeSite, SiteReport } from '@/lib/api-client/types';
import { FREE_STARTER_CREDITS, PRO_MONTHLY_QUOTA, PRO_RATE_LIMIT_RPM } from '@/lib/auth/session';
import { normalizeDirectorySlug, normalizeDomainInput } from '@/lib/utils';

/**
 * JSON-LD Structured Data Generators
 * Following schema.org specifications for rich snippets
 */

export interface JsonLdWebPage {
  '@context': 'https://schema.org';
  '@type': 'WebPage';
  name: string;
  description: string;
  url: string;
  dateModified?: string;
  datePublished?: string;
  breadcrumb?: {
    '@type': 'BreadcrumbList';
    itemListElement: Array<{
      '@type': 'ListItem';
      position: number;
      name: string;
      item?: string;
    }>;
  };
}

export interface JsonLdOrganization {
  '@context': 'https://schema.org';
  '@type': 'Organization';
  name: string;
  url: string;
  logo: string;
  description?: string;
  sameAs?: string[];
}

export interface JsonLdWebSite {
  '@context': 'https://schema.org';
  '@type': 'WebSite';
  name: string;
  url: string;
  description: string;
  potentialAction?: {
    '@type': 'SearchAction';
    target: string;
    'query-input': string;
  };
}

export interface JsonLdDataset {
  '@context': 'https://schema.org';
  '@type': 'Dataset';
  name: string;
  description: string;
  url: string;
  creator: {
    '@type': 'Organization';
    name: string;
  };
  dateModified?: string;
  license?: string;
  variableMeasured?: string[];
}

export interface JsonLdBreadcrumbList {
  '@context': 'https://schema.org';
  '@type': 'BreadcrumbList';
  itemListElement: Array<{
    '@type': 'ListItem';
    position: number;
    name: string;
    item?: string;
  }>;
}

export interface JsonLdFAQPage {
  '@context': 'https://schema.org';
  '@type': 'FAQPage';
  mainEntity: Array<{
    '@type': 'Question';
    name: string;
    acceptedAnswer: {
      '@type': 'Answer';
      text: string;
    };
  }>;
}

export interface JsonLdSoftwareApplication {
  '@context': 'https://schema.org';
  '@type': 'SoftwareApplication';
  name: string;
  applicationCategory: string;
  operatingSystem: string;
  offers: {
    '@type': 'Offer';
    price: string;
    priceCurrency: string;
  };
  aggregateRating?: {
    '@type': 'AggregateRating';
    ratingValue: string;
    ratingCount: string;
  };
}

const BASE_URL = (process.env.PUBLIC_SITE_BASE_URL ?? 'https://sitejson.com').replace(/\/+$/, '');

const toAbsoluteUrl = (path: string): string => (
  `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`
);

const toDisplayLabel = (value: string): string => {
  const words = value
    .trim()
    .split('-')
    .filter(Boolean);

  if (words.length === 0) return value;
  return words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

/**
 * Generate Organization structured data
 */
export function generateOrganizationJsonLd(): JsonLdOrganization {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'SiteJSON',
    url: BASE_URL,
    logo: toAbsoluteUrl('/icons/icon-192x192.png'),
    description: 'Website intelligence API for traffic estimates, tech stack detection, SEO analysis, and trust signals.',
    sameAs: [
      'https://twitter.com/sitejson',
      'https://github.com/sitejson',
    ],
  };
}

/**
 * Generate WebSite structured data with search action
 */
export function generateWebSiteJsonLd(): JsonLdWebSite {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'SiteJSON',
    url: BASE_URL,
    description: 'Website intelligence API for traffic estimates, tech stack detection, SEO analysis, and trust signals.',
    potentialAction: {
      '@type': 'SearchAction',
      target: toAbsoluteUrl('/data/{search_term_string}'),
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Generate WebPage structured data
 */
export function generateWebPageJsonLd(
  title: string,
  description: string,
  path: string,
  dateModified?: string
): JsonLdWebPage {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description,
    url: toAbsoluteUrl(path),
    ...(dateModified && { dateModified }),
  };
}

/**
 * Generate BreadcrumbList structured data
 */
export function generateBreadcrumbJsonLd(
  items: Array<{ name: string; path?: string }>
): JsonLdBreadcrumbList {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      ...(item.path ? { item: toAbsoluteUrl(item.path) } : {}),
    })),
  };
}

/**
 * Generate Dataset structured data for site reports
 */
export function generateDatasetJsonLd(
  domain: string,
  report: SiteReport
): JsonLdDataset {
  const normalizedDomain = normalizeDomainInput(domain);
  const metrics: string[] = [];
  if (report.seo) metrics.push('SEO Score', 'Link Structure', 'Heading Analysis');
  if (report.trafficData) metrics.push('Traffic Volume', 'Bounce Rate', 'Visit Duration');
  if (report.dns) metrics.push('DNS Configuration', 'Infrastructure');
  if (report.aiAnalysis) metrics.push('Trust Score', 'Business Analysis');

  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: `${normalizedDomain} Website Intelligence Report`,
    description: `Comprehensive website analysis for ${normalizedDomain} including traffic estimates, SEO metrics, technology stack, and trust signals.`,
    url: toAbsoluteUrl(`/data/${normalizedDomain}`),
    creator: {
      '@type': 'Organization',
      name: 'SiteJSON',
    },
    ...(report.updatedAt && { dateModified: report.updatedAt }),
    license: 'https://sitejson.com/terms',
    variableMeasured: metrics,
  };
}

/**
 * Generate FAQPage structured data
 */
export function generateFAQJsonLd(
  faqs: Array<{ question: string; answer: string }>
): JsonLdFAQPage {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generate SoftwareApplication structured data
 */
export function generateSoftwareApplicationJsonLd(): JsonLdSoftwareApplication {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'SiteJSON API',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  };
}

/**
 * Combine multiple JSON-LD objects into a single script using @graph
 * This is the recommended approach for multiple schemas on one page
 */
export function combineJsonLd(objects: unknown[]): string {
  const validObjects = objects.filter((item) => item != null);
  if (validObjects.length === 1) {
    return JSON.stringify(validObjects[0]);
  }
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': validObjects,
  });
}

/**
 * Generate complete homepage JSON-LD with all relevant schemas
 */
export function generateHomepageJsonLd(): string {
  const organization = generateOrganizationJsonLd();
  const website = generateWebSiteJsonLd();
  const webpage = generateWebPageJsonLd(
    'SiteJSON — Website Intelligence API, Directory, and Live Reports',
    'Browse website intelligence by category, technology, and topic, then open live reports with traffic, SEO, tech stack, and trust signals.',
    '/'
  );
  const software = generateSoftwareApplicationJsonLd();
  const dataset = generateDatasetJsonLd('Website Intelligence Directory', {
    taxonomy: {
      tags: ['category directories', 'technology directories', 'topic research'],
    },
    meta: {
      techStackDetected: ['traffic estimates', 'SEO structure', 'trust signals'],
    },
  });

  const faqs = generateFAQJsonLd([
    {
      question: 'What is SiteJSON?',
      answer: 'SiteJSON is a website intelligence platform that helps analysts browse directories and open live domain reports with traffic, SEO, technology, business, and trust signals.',
    },
    {
      question: 'How should I use the site if I am not ready for the API?',
      answer: 'Start with the directory hub, choose a category, technology, or topic path, then open live report pages to compare real domains before deciding whether you need API access.',
    },
    {
      question: 'What data does SiteJSON provide?',
      answer: 'SiteJSON provides website intelligence including traffic statistics, ranking signals, SEO structure, technology stack detection, business analysis, and AI-assisted trust indicators.',
    },
    {
      question: 'Is there a free tier?',
      answer: `SiteJSON API access requires a key. GitHub login grants ${FREE_STARTER_CREDITS} one-time starter requests and a signed API key. Pro adds ${PRO_MONTHLY_QUOTA} requests per billing cycle at ${PRO_RATE_LIMIT_RPM} req/min and is manually activated until checkout launches.`,
    },
  ]);

  return combineJsonLd([organization, website, webpage, software, dataset, faqs]);
}

export function generateDataPageJsonLd({
  domain,
  report,
  updatedAt,
  subPage,
  alternatives,
}: {
  domain: string;
  report: SiteReport;
  updatedAt?: string;
  subPage?: 'traffic' | 'seo' | 'tech' | 'business' | 'alternatives';
  alternatives?: AlternativeSite[];
}): string {
  const normalizedDomain = normalizeDomainInput(domain);
  const path = subPage ? `/data/${normalizedDomain}/${subPage}` : `/data/${normalizedDomain}`;

  const webpage = generateWebPageJsonLd(
    `${normalizedDomain} Website Intelligence Report`,
    `Analyze ${normalizedDomain} with SEO, infrastructure, monetization, and trust signals.`,
    path,
    updatedAt
  );

  const breadcrumbItems: Array<{ name: string; path?: string }> = [
    { name: 'Home', path: '/' },
    { name: normalizedDomain, path: `/data/${normalizedDomain}` },
  ];

  if (subPage) {
    breadcrumbItems.push({
      name: subPage.charAt(0).toUpperCase() + subPage.slice(1),
    });
  }

  const breadcrumb = generateBreadcrumbJsonLd(breadcrumbItems);
  const dataset = generateDatasetJsonLd(normalizedDomain, report);

  const objects: unknown[] = [webpage, breadcrumb, dataset];

  if (subPage === 'alternatives' && alternatives && alternatives.length > 0) {
    objects.push(generateItemListJsonLd(normalizedDomain, alternatives));
  }

  return combineJsonLd(objects);
}

export function generateItemListJsonLd(
  domain: string,
  alternatives: AlternativeSite[],
): {
  '@context': 'https://schema.org';
  '@type': 'ItemList';
  name: string;
  numberOfItems: number;
  itemListElement: Array<{
    '@type': 'ListItem';
    position: number;
    name: string;
    url: string;
  }>;
} {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Alternatives to ${domain}`,
    numberOfItems: alternatives.length,
    itemListElement: alternatives.map((alt, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: alt.title ?? alt.domain,
      url: toAbsoluteUrl(`/data/${alt.domain}`),
    })),
  };
}

export function generateDirectoryHubJsonLd(): string {
  const webpage = generateWebPageJsonLd(
    'Website Directory Hub',
    'Browse SiteJSON directories by category, technology, and topic, then open live domain reports.',
    '/directory'
  );

  const breadcrumb = generateBreadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Directory' },
  ]);

  return combineJsonLd([webpage, breadcrumb]);
}

export function generateDirectoryTypeHubJsonLd(type: string, slug: string): string {
  const normalizedType = type.trim().toLowerCase();
  const normalizedSlug = normalizeDirectorySlug(slug) || slug.trim().toLowerCase();
  const displayType = toDisplayLabel(normalizedType);
  const displaySlug = toDisplayLabel(normalizedSlug);

  const webpage = generateWebPageJsonLd(
    `${displayType} Directory Hub`,
    `Browse ${displayType.toLowerCase()} directories and move into live domain reports from a utility-first hub page.`,
    `/directory/${normalizedType}`
  );

  const breadcrumb = generateBreadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Directory', path: '/directory' },
    { name: displayType },
  ]);

  const faq = generateFAQJsonLd([
    {
      question: `How do I use the ${displayType.toLowerCase()} directory hub?`,
      answer: `Start with the featured ${displaySlug} example, open a few live reports, and then pivot into another browse path if you need broader context.`,
    },
  ]);

  return combineJsonLd([webpage, breadcrumb, faq]);
}

export function generateComparePageJsonLd(domainA: string, domainB: string): string {
  const a = normalizeDomainInput(domainA);
  const b = normalizeDomainInput(domainB);
  const [first, second] = a < b ? [a, b] : [b, a];
  const path = `/compare/${first}/vs/${second}`;

  const webpage = generateWebPageJsonLd(
    `${first} vs ${second} — Website Comparison`,
    `Compare ${first} and ${second} side by side: traffic, technology, trust score, and more.`,
    path,
  );

  const breadcrumb = generateBreadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Compare' },
    { name: `${first} vs ${second}` },
  ]);

  return combineJsonLd([webpage, breadcrumb]);
}

export function generateDirectoryPageJsonLd({
  type,
  slug,
  faqs,
  pageNum,
}: {
  type: string;
  slug: string;
  faqs?: Array<{ question: string; answer: string }>;
  pageNum?: number;
}): string {
  const normalizedType = type.trim().toLowerCase();
  const normalizedSlug = normalizeDirectorySlug(slug) || slug.trim().toLowerCase();
  const basePath = `/directory/${normalizedType}/${normalizedSlug}`;
  const path = pageNum && pageNum > 1 ? `${basePath}/page/${pageNum}` : basePath;
  const displayType = toDisplayLabel(normalizedType);
  const displaySlug = toDisplayLabel(normalizedSlug);
  const pageSuffix = pageNum && pageNum > 1 ? ` — Page ${pageNum}` : '';

  const webpage = generateWebPageJsonLd(
    `Top ${displaySlug} Websites — ${displayType} Directory${pageSuffix}`,
    `Discover the most popular websites ${normalizedType === 'technology' ? 'built with' : 'in'} ${displaySlug}. Ranked by traffic, authority, and AI analysis.`,
    path
  );

  const breadcrumbItems: Array<{ name: string; path?: string }> = [
    { name: 'Home', path: '/' },
    { name: 'Directory', path: '/directory' },
    { name: displayType, path: `/directory/${normalizedType}` },
  ];
  if (pageNum && pageNum > 1) {
    breadcrumbItems.push({ name: displaySlug, path: basePath });
    breadcrumbItems.push({ name: `Page ${pageNum}` });
  } else {
    breadcrumbItems.push({ name: displaySlug });
  }
  const breadcrumb = generateBreadcrumbJsonLd(breadcrumbItems);

  const objects: unknown[] = [webpage, breadcrumb];
  if (faqs && faqs.length > 0) {
    objects.push(generateFAQJsonLd(faqs));
  }

  return combineJsonLd(objects);
}
