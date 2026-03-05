import type { Metadata } from 'next';
import { normalizeDirectorySlug, normalizeDomainInput } from '@/lib/utils';

const siteName = 'SiteJSON';
const BASE_URL = (process.env.PUBLIC_SITE_BASE_URL ?? 'https://sitejson.com').replace(/\/+$/, '');

const toDisplayLabel = (value: string): string => value
  .trim()
  .split('-')
  .filter(Boolean)
  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
  .join(' ');

// Default OG image configuration
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
  description: 'Website intelligence API for traffic estimates, tech stack detection, SEO analysis, and structured site signals. Enrich your data in under 200ms.',
  keywords: ['website intelligence', 'SEO analysis', 'tech stack detection', 'traffic estimation', 'domain analysis', 'API'],
  authors: [{ name: 'SiteJSON' }],
  creator: 'SiteJSON',
  publisher: 'SiteJSON',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
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
    description: 'Website intelligence API for traffic estimates, tech stack detection, SEO analysis, and structured site signals. Enrich your data in under 200ms.',
    images: [defaultOGImage],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@sitejson',
    creator: '@sitejson',
    title: `${siteName} — Website Intelligence, Structured Data`,
    description: 'Website intelligence API for traffic estimates, tech stack detection, SEO analysis, and structured site signals. Enrich your data in under 200ms.',
    images: [`${BASE_URL}/api/og`],
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  alternates: {
    canonical: '/',
    types: {
      'application/rss+xml': `${BASE_URL}/rss.xml`,
    },
  },
});

export const buildReportMetadata = (domain: string, data?: { traffic?: number }): Metadata => {
  const normalizedDomain = normalizeDomainInput(domain);
  const trafficText = data?.traffic ? ` and ${(data.traffic / 1000000).toFixed(1)}M monthly visits` : '';

  return {
    title: `${normalizedDomain} Website Intelligence Report`,
    description: `Comprehensive analysis of ${normalizedDomain}${trafficText}. SEO metrics, tech stack, traffic data, and structured site signals.`,
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
  subPage: 'traffic' | 'seo' | 'tech' | 'business',
): Metadata => {
  const normalizedDomain = normalizeDomainInput(domain);
  const titles: Record<string, string> = {
    traffic: `${normalizedDomain} Traffic Statistics & Analytics`,
    seo: `${normalizedDomain} SEO Analysis & Structure`,
    tech: `${normalizedDomain} Technology Stack & Infrastructure`,
    business: `${normalizedDomain} Business Intelligence`,
  };
  const descriptions: Record<string, string> = {
    traffic: `Monthly visits, bounce rate, traffic sources, top regions, and keywords for ${normalizedDomain}.`,
    seo: `Heading structure, link analysis, technical files, and taxonomy for ${normalizedDomain}.`,
    tech: `Technology stack, DNS records, infrastructure details, and provider health for ${normalizedDomain}.`,
    business: `AI business intelligence, trust assessment, advertising, and monetization data for ${normalizedDomain}.`,
  };
  const ogImages: Record<string, string> = {
    traffic: `${BASE_URL}/api/og?domain=${encodeURIComponent(normalizedDomain)}&type=traffic`,
    seo: `${BASE_URL}/api/og?domain=${encodeURIComponent(normalizedDomain)}&type=seo`,
    tech: `${BASE_URL}/api/og?domain=${encodeURIComponent(normalizedDomain)}&type=tech`,
    business: `${BASE_URL}/api/og?domain=${encodeURIComponent(normalizedDomain)}&type=business`,
  };
  return {
    title: titles[subPage],
    description: descriptions[subPage],
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

export const buildDirectoryMetadata = (type: string, slug: string): Metadata => {
  const normalizedType = type.trim().toLowerCase();
  const normalizedSlug = normalizeDirectorySlug(slug) || slug.trim().toLowerCase();
  const display = toDisplayLabel(normalizedSlug) || normalizedSlug;
  const displayType = toDisplayLabel(normalizedType) || normalizedType;
  const label = normalizedType === 'technology' ? 'built with' : 'in';
  return {
    title: `Top ${display} Websites — ${displayType} Directory`,
    description: `Discover the most popular websites ${label} ${display}. Ranked by traffic, authority, and AI analysis.`,
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
