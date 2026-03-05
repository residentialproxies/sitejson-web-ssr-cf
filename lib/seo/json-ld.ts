import type { SiteReport } from '@/lib/api-client/types';
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
      target: toAbsoluteUrl('/site/{search_term_string}'),
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
    'SiteJSON — Website Intelligence, Structured Data',
    'Website intelligence API for traffic estimates, tech stack detection, SEO analysis, and trust signals.',
    '/'
  );
  const software = generateSoftwareApplicationJsonLd();

  const faqs = generateFAQJsonLd([
    {
      question: 'What is SiteJSON?',
      answer: 'SiteJSON is a website intelligence API that provides structured data about any domain, including traffic estimates, technology stack detection, SEO analysis, and trust signals.',
    },
    {
      question: 'How accurate are the traffic estimates?',
      answer: 'Our traffic estimates combine multiple data sources including Cloudflare Radar and proprietary algorithms to provide highly accurate monthly visit counts, typically within 10-15% of actual values.',
    },
    {
      question: 'What data does SiteJSON provide?',
      answer: 'SiteJSON provides comprehensive website intelligence including: traffic statistics (monthly visits, bounce rate, visit duration), SEO metrics (heading structure, link analysis), technology stack detection, DNS and infrastructure details, AI-powered business classification, and legitimacy scoring.',
    },
    {
      question: 'Is there a free tier?',
      answer: 'Yes, SiteJSON offers a free tier with 100 requests per month. No credit card is required to get started.',
    },
    {
      question: 'How do I integrate SiteJSON into my application?',
      answer: 'SiteJSON provides a simple REST API with JSON responses. You can make HTTP requests to our endpoints using your API key. We offer SDKs for popular languages including Node.js, Python, and Go.',
    },
  ]);

  return combineJsonLd([organization, website, webpage, software, faqs]);
}

/**
 * Generate complete data page JSON-LD with WebPage, BreadcrumbList, and Dataset
 */
export function generateDataPageJsonLd({
  domain,
  report,
  updatedAt,
  subPage,
}: {
  domain: string;
  report: SiteReport;
  updatedAt?: string;
  subPage?: 'traffic' | 'seo' | 'tech' | 'business';
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

  return combineJsonLd([webpage, breadcrumb, dataset]);
}

/**
 * Generate directory page JSON-LD
 */
export function generateDirectoryPageJsonLd({
  type,
  slug,
}: {
  type: string;
  slug: string;
}): string {
  const normalizedType = type.trim().toLowerCase();
  const normalizedSlug = normalizeDirectorySlug(slug) || slug.trim().toLowerCase();
  const path = `/directory/${normalizedType}/${normalizedSlug}`;
  const displayType = toDisplayLabel(normalizedType);
  const displaySlug = toDisplayLabel(normalizedSlug);

  const webpage = generateWebPageJsonLd(
    `Top ${displaySlug} Websites — ${displayType} Directory`,
    `Discover the most popular websites ${normalizedType === 'technology' ? 'built with' : 'in'} ${displaySlug}. Ranked by traffic, authority, and AI analysis.`,
    path
  );

  const breadcrumb = generateBreadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Directory', path: '/directory' },
    { name: displayType, path: `/directory/${normalizedType}` },
    { name: displaySlug },
  ]);

  return combineJsonLd([webpage, breadcrumb]);
}
