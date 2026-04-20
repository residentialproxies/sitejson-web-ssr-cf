import type { Metadata } from 'next';
import type { DirectoryType } from '@/lib/pseo';
import { normalizeDirectorySlug, normalizeDomainInput } from '@/lib/utils';

const siteName = 'SiteJSON';
const BASE_URL = (process.env.PUBLIC_SITE_BASE_URL ?? 'https://sitejson.com').replace(/\/+$/, '');

const toDisplayLabel = (value: string): string => value
  .trim()
  .split('-')
  .filter(Boolean)
  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
  .join(' ');

const defaultOGImage = {
  url: `${BASE_URL}/api/og`,
  width: 1200,
  height: 630,
  alt: 'SiteJSON - Website Intelligence Platform',
};

export const buildBaseMetadata = (): Metadata => ({
  metadataBase: new URL(BASE_URL),
  title: {
    default: `${siteName} — Website Intelligence, Structured Data`,
    template: `%s | ${siteName}`,
  },
  description: 'Browse website intelligence by market, technology, and topic. Open live reports with traffic, SEO, technology, and trust signals.',
  keywords: ['website intelligence', 'SEO analysis', 'tech stack detection', 'traffic estimation', 'domain analysis', 'API'],
  authors: [{ name: 'SiteJSON' }],
  creator: 'SiteJSON',
  publisher: 'SiteJSON',
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icons/icon-96x96.png', type: 'image/png', sizes: '96x96' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.ico',
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    other: [{ rel: 'manifest', url: '/site.webmanifest' }],
  },
  openGraph: {
    type: 'website',
    siteName,
    title: `${siteName} — Website Intelligence, Structured Data`,
    description: 'Browse website intelligence by market, technology, and topic. Open live reports with traffic, SEO, technology, and trust signals.',
    images: [defaultOGImage],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@sitejson',
    creator: '@sitejson',
    title: `${siteName} — Website Intelligence, Structured Data`,
    description: 'Browse website intelligence by market, technology, and topic. Open live reports with traffic, SEO, technology, and trust signals.',
    images: [`${BASE_URL}/api/og`],
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  alternates: {
    types: {
      'application/rss+xml': `${BASE_URL}/rss.xml`,
    },
  },
});

export const buildHomeMetadata = (): Metadata => ({
  title: 'Compare Websites, Traffic, SEO & Tech Stack Data',
  description: 'Compare websites, browse competitor directories, and open live domain reports with traffic estimates, SEO structure, tech stack, and trust signals.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: `Compare Websites, Traffic, SEO & Tech Stack Data | ${siteName}`,
    description: 'Compare websites, browse competitor directories, and open live domain reports with traffic estimates, SEO structure, tech stack, and trust signals.',
    url: '/',
    type: 'website',
    images: [defaultOGImage],
  },
  twitter: {
    card: 'summary_large_image',
    title: `Compare Websites, Traffic, SEO & Tech Stack Data | ${siteName}`,
    description: 'Compare websites, browse competitor directories, and open live domain reports with traffic estimates, SEO structure, tech stack, and trust signals.',
    images: [`${BASE_URL}/api/og`],
  },
});

export const buildReportMetadata = (
  domain: string,
  data?: { traffic?: number },
  options?: { index?: boolean; follow?: boolean },
): Metadata => {
  const normalizedDomain = normalizeDomainInput(domain);
  const trafficText = data?.traffic ? ` and ${(data.traffic / 1000000).toFixed(1)}M monthly visits` : '';
  const index = options?.index ?? true;
  const follow = options?.follow ?? true;

  return {
    title: `${normalizedDomain} Website Intelligence Report`,
    description: `Comprehensive analysis of ${normalizedDomain}${trafficText}. SEO metrics, tech stack, traffic data, and structured site signals.`,
    robots: { index, follow },
    alternates: {
      canonical: `/data/${normalizedDomain}`,
    },
    openGraph: {
      title: `${normalizedDomain} Website Intelligence Report | ${siteName}`,
      description: `Comprehensive analysis of ${normalizedDomain}${trafficText}. SEO metrics, tech stack, traffic data, and structured site signals.`,
      url: `/data/${normalizedDomain}`,
      type: 'article',
      images: [{
        url: `${BASE_URL}/api/og?domain=${encodeURIComponent(normalizedDomain)}`,
        width: 1200,
        height: 630,
        alt: `${normalizedDomain} website analysis report`,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${normalizedDomain} Website Intelligence Report | ${siteName}`,
      description: `Comprehensive analysis of ${normalizedDomain}${trafficText}. SEO metrics, tech stack, traffic data, and structured site signals.`,
      images: [`${BASE_URL}/api/og?domain=${encodeURIComponent(normalizedDomain)}`],
    },
  };
};

export const buildSitePageMetadata = (domain: string): Metadata => {
  const normalizedDomain = normalizeDomainInput(domain);
  return {
    title: `Analyzing ${normalizedDomain}`,
    description: `Live analysis of ${normalizedDomain} — SEO, traffic, tech stack, and business intelligence.`,
    robots: { index: false, follow: true },
    alternates: {
      canonical: `/data/${normalizedDomain}`,
    },
  };
};

export const buildDataSubPageMetadata = (
  domain: string,
  subPage: 'traffic' | 'seo' | 'tech' | 'business' | 'alternatives',
  options?: { index?: boolean; follow?: boolean },
): Metadata => {
  const normalizedDomain = normalizeDomainInput(domain);
  const index = options?.index ?? true;
  const follow = options?.follow ?? true;
  const titles: Record<string, string> = {
    traffic: `${normalizedDomain} Traffic Statistics & Analytics`,
    seo: `${normalizedDomain} SEO Analysis & Structure`,
    tech: `${normalizedDomain} Technology Stack & Infrastructure`,
    business: `${normalizedDomain} Business Intelligence`,
    alternatives: `${normalizedDomain} Alternatives & Similar Sites`,
  };
  const descriptions: Record<string, string> = {
    traffic: `Monthly visits, bounce rate, traffic sources, top regions, and keywords for ${normalizedDomain}.`,
    seo: `Heading structure, link analysis, technical files, and taxonomy for ${normalizedDomain}.`,
    tech: `Technology stack, DNS records, infrastructure details, and provider health for ${normalizedDomain}.`,
    business: `AI business intelligence, trust assessment, advertising, and monetization data for ${normalizedDomain}.`,
    alternatives: `Discover alternatives and competitors to ${normalizedDomain}. Compare similar websites by traffic, trust score, and technology stack.`,
  };
  const ogImages: Record<string, string> = {
    traffic: `${BASE_URL}/api/og?domain=${encodeURIComponent(normalizedDomain)}&type=traffic`,
    seo: `${BASE_URL}/api/og?domain=${encodeURIComponent(normalizedDomain)}&type=seo`,
    tech: `${BASE_URL}/api/og?domain=${encodeURIComponent(normalizedDomain)}&type=tech`,
    business: `${BASE_URL}/api/og?domain=${encodeURIComponent(normalizedDomain)}&type=business`,
    alternatives: `${BASE_URL}/api/og?domain=${encodeURIComponent(normalizedDomain)}&type=alternatives`,
  };

  return {
    title: titles[subPage],
    description: descriptions[subPage],
    robots: { index, follow },
    alternates: {
      canonical: `/data/${normalizedDomain}/${subPage}`,
    },
    openGraph: {
      title: `${titles[subPage]} | ${siteName}`,
      description: descriptions[subPage],
      url: `/data/${normalizedDomain}/${subPage}`,
      type: 'article',
      images: [{
        url: ogImages[subPage],
        width: 1200,
        height: 630,
        alt: `${normalizedDomain} ${subPage} analysis`,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${titles[subPage]} | ${siteName}`,
      description: descriptions[subPage],
      images: [ogImages[subPage]],
    },
  };
};

export const buildDirectoryHubMetadata = (): Metadata => ({
  title: 'Website Directory Hub',
  description: 'Browse SiteJSON directories by category, technology, and topic. Use the hub to move from discovery into live domain reports.',
  alternates: {
    canonical: '/directory',
  },
  openGraph: {
    title: `Website Directory Hub | ${siteName}`,
    description: 'Browse SiteJSON directories by category, technology, and topic. Use the hub to move from discovery into live domain reports.',
    url: '/directory',
    type: 'website',
    images: [{
      url: `${BASE_URL}/api/og?type=directory` ,
      width: 1200,
      height: 630,
      alt: 'SiteJSON directory hub',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `Website Directory Hub | ${siteName}`,
    description: 'Browse SiteJSON directories by category, technology, and topic. Use the hub to move from discovery into live domain reports.',
    images: [`${BASE_URL}/api/og?type=directory`],
  },
});

export const buildInsightsMetadata = (): Metadata => ({
  title: 'Global Website Insights',
  description: 'Aggregated statistics across indexed websites: traffic coverage, score distribution, top categories, technologies, and topics.',
  alternates: {
    canonical: '/insights',
  },
  openGraph: {
    title: `Global Website Insights | ${siteName}`,
    description: 'Aggregated statistics across indexed websites: traffic coverage, score distribution, top categories, technologies, and topics.',
    url: '/insights',
    type: 'website',
    images: [{
      url: `${BASE_URL}/api/og?type=insights`,
      width: 1200,
      height: 630,
      alt: 'SiteJSON global insights',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `Global Website Insights | ${siteName}`,
    description: 'Aggregated statistics across indexed websites: traffic coverage, score distribution, top categories, technologies, and topics.',
    images: [`${BASE_URL}/api/og?type=insights`],
  },
});

export const buildDirectoryTypeHubMetadata = (type: DirectoryType): Metadata => {
  const displayType = toDisplayLabel(type);

  return {
    title: `${displayType} Directory Hub`,
    description: `Browse SiteJSON ${type} directories, preview live domains, and move into detailed reports without leaving the browse flow.`,
    alternates: {
      canonical: `/directory/${type}`,
    },
    openGraph: {
      title: `${displayType} Directory Hub | ${siteName}`,
      description: `Browse SiteJSON ${type} directories, preview live domains, and move into detailed reports without leaving the browse flow.`,
      url: `/directory/${type}`,
      type: 'website',
      images: [{
        url: `${BASE_URL}/api/og?type=directory&category=${encodeURIComponent(type)}`,
        width: 1200,
        height: 630,
        alt: `${displayType} directory hub`,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${displayType} Directory Hub | ${siteName}`,
      description: `Browse SiteJSON ${type} directories, preview live domains, and move into detailed reports without leaving the browse flow.`,
      images: [`${BASE_URL}/api/og?type=directory&category=${encodeURIComponent(type)}`],
    },
  };
};

export const buildCompareMetadata = (
  domainA: string,
  domainB: string,
  options?: { index?: boolean; follow?: boolean },
): Metadata => {
  const a = normalizeDomainInput(domainA);
  const b = normalizeDomainInput(domainB);
  const [first, second] = a < b ? [a, b] : [b, a];
  const path = `/compare/${first}/vs/${second}`;
  const index = options?.index ?? true;
  const follow = options?.follow ?? true;

  return {
    title: `${first} vs ${second} — Compare Website Traffic, SEO & Tech Stack`,
    description: `Compare ${first} vs ${second} with estimated traffic, SEO structure, detected tech stack, trust score, and category signals.`,
    robots: { index, follow },
    alternates: {
      canonical: path,
    },
    openGraph: {
      title: `${first} vs ${second} — Compare Website Traffic, SEO & Tech Stack | ${siteName}`,
      description: `Compare ${first} vs ${second} with estimated traffic, SEO structure, detected tech stack, trust score, and category signals.`,
      url: path,
      type: 'article',
      images: [defaultOGImage],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${first} vs ${second} — Compare Website Traffic, SEO & Tech Stack | ${siteName}`,
      description: `Compare ${first} vs ${second} with estimated traffic, SEO structure, detected tech stack, trust score, and category signals.`,
      images: [`${BASE_URL}/api/og`],
    },
  };
};

export const buildPaginatedDirectoryMetadata = (
  type: string,
  slug: string,
  pageNum: number,
  totalPages: number,
  options?: { index?: boolean; follow?: boolean },
): Metadata => {
  const normalizedType = type.trim().toLowerCase();
  const normalizedSlug = normalizeDirectorySlug(slug) || slug.trim().toLowerCase();
  const display = toDisplayLabel(normalizedSlug) || normalizedSlug;
  const label = normalizedType === 'technology' ? 'built with' : 'in';
  const basePath = `/directory/${normalizedType}/${normalizedSlug}`;
  const path = `${basePath}/page/${pageNum}`;
  const index = options?.index ?? true;
  const follow = options?.follow ?? true;

  const alternates: Record<string, string> = { canonical: path };
  if (pageNum === 2) {
    alternates.prev = basePath;
  } else if (pageNum > 2) {
    alternates.prev = `${basePath}/page/${pageNum - 1}`;
  }
  if (pageNum < totalPages) {
    alternates.next = `${basePath}/page/${pageNum + 1}`;
  }

  return {
    title: `Top ${display} Websites — Page ${pageNum}`,
    description: `Page ${pageNum} of the most popular websites ${label} ${display}. Ranked by traffic, authority, and AI analysis.`,
    robots: { index, follow },
    alternates,
    openGraph: {
      title: `Top ${display} Websites — Page ${pageNum} | ${siteName}`,
      description: `Page ${pageNum} of the most popular websites ${label} ${display}. Ranked by traffic, authority, and AI analysis.`,
      url: path,
      type: 'website',
      images: [{
        url: `${BASE_URL}/api/og?type=directory&category=${encodeURIComponent(normalizedSlug)}`,
        width: 1200,
        height: 630,
        alt: `Top ${display} websites directory — page ${pageNum}`,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Top ${display} Websites — Page ${pageNum} | ${siteName}`,
      description: `Page ${pageNum} of the most popular websites ${label} ${display}. Ranked by traffic, authority, and AI analysis.`,
      images: [`${BASE_URL}/api/og?type=directory&category=${encodeURIComponent(normalizedSlug)}`],
    },
  };
};

export const buildDirectoryMetadata = (
  type: string,
  slug: string,
  options?: { index?: boolean },
): Metadata => {
  const normalizedType = type.trim().toLowerCase();
  const normalizedSlug = normalizeDirectorySlug(slug) || slug.trim().toLowerCase();
  const display = toDisplayLabel(normalizedSlug) || normalizedSlug;
  const displayType = toDisplayLabel(normalizedType) || normalizedType;
  const label = normalizedType === 'technology' ? 'built with' : 'in';
  const index = options?.index ?? true;

  return {
    title: `Top ${display} Websites — ${displayType} Directory`,
    description: `Discover the most popular websites ${label} ${display}. Ranked by traffic, authority, and AI analysis.`,
    robots: {
      index,
      follow: true,
    },
    alternates: {
      canonical: `/directory/${normalizedType}/${normalizedSlug}`,
    },
    openGraph: {
      title: `Top ${display} Websites — ${displayType} Directory | ${siteName}`,
      description: `Discover the most popular websites ${label} ${display}. Ranked by traffic, authority, and AI analysis.`,
      url: `/directory/${normalizedType}/${normalizedSlug}`,
      type: 'website',
      images: [{
        url: `${BASE_URL}/api/og?type=directory&category=${encodeURIComponent(normalizedSlug)}`,
        width: 1200,
        height: 630,
        alt: `Top ${display} websites directory`,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Top ${display} Websites | ${siteName}`,
      description: `Discover the most popular websites ${label} ${display}. Ranked by traffic, authority, and AI analysis.`,
      images: [`${BASE_URL}/api/og?type=directory&category=${encodeURIComponent(normalizedSlug)}`],
    },
  };
};
