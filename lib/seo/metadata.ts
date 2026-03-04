import type { Metadata } from 'next';

const siteName = 'SiteJSON';
const BASE_URL = process.env.PUBLIC_SITE_BASE_URL ?? 'https://sitejson.com';

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
  description: 'Website intelligence API for traffic estimates, tech stack detection, SEO analysis, and trust signals. Enrich your data in under 200ms.',
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
    description: 'Website intelligence API for traffic estimates, tech stack detection, SEO analysis, and trust signals. Enrich your data in under 200ms.',
    images: [defaultOGImage],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@sitejson',
    creator: '@sitejson',
    title: `${siteName} — Website Intelligence, Structured Data`,
    description: 'Website intelligence API for traffic estimates, tech stack detection, SEO analysis, and trust signals. Enrich your data in under 200ms.',
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

export const buildReportMetadata = (domain: string, data?: { score?: number; traffic?: number }): Metadata => {
  const scoreText = data?.score ? ` with trust score ${data.score}` : '';
  const trafficText = data?.traffic ? ` and ${(data.traffic / 1000000).toFixed(1)}M monthly visits` : '';

  return {
    title: `${domain} Website Intelligence Report`,
    description: `Comprehensive analysis of ${domain}${scoreText}${trafficText}. SEO metrics, tech stack, traffic data, and trust signals.`,
    alternates: {
      canonical: `/data/${domain}`,
    },
    openGraph: {
      title: `${domain} Website Intelligence Report | ${siteName}`,
      description: `Comprehensive analysis of ${domain}${scoreText}${trafficText}. SEO metrics, tech stack, traffic data, and trust signals.`,
      url: `/data/${domain}`,
      type: 'article',
      images: [{
        url: `${BASE_URL}/api/og?domain=${encodeURIComponent(domain)}${data?.score ? `&score=${data.score}` : ''}`,
        width: 1200,
        height: 630,
        alt: `${domain} website analysis report`,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${domain} Website Intelligence Report | ${siteName}`,
      description: `Comprehensive analysis of ${domain}${scoreText}${trafficText}. SEO metrics, tech stack, traffic data, and trust signals.`,
      images: [`${BASE_URL}/api/og?domain=${encodeURIComponent(domain)}${data?.score ? `&score=${data.score}` : ''}`],
    },
  };
};

export const buildSitePageMetadata = (domain: string): Metadata => ({
  title: `Analyzing ${domain}`,
  description: `Live analysis of ${domain} — SEO, traffic, tech stack, and trust score.`,
  robots: { index: false, follow: true },
  alternates: {
    canonical: `/data/${domain}`,
  },
});

export const buildDataSubPageMetadata = (
  domain: string,
  subPage: 'traffic' | 'seo' | 'tech' | 'business',
): Metadata => {
  const titles: Record<string, string> = {
    traffic: `${domain} Traffic Statistics & Analytics`,
    seo: `${domain} SEO Analysis & Score`,
    tech: `${domain} Technology Stack & Infrastructure`,
    business: `${domain} Business Intelligence & Trust`,
  };
  const descriptions: Record<string, string> = {
    traffic: `Monthly visits, bounce rate, traffic sources, top regions, and keywords for ${domain}.`,
    seo: `SEO score, heading structure, link analysis, technical files, and taxonomy for ${domain}.`,
    tech: `Technology stack, DNS records, infrastructure details, and provider health for ${domain}.`,
    business: `AI business intelligence, trust assessment, advertising, and monetization data for ${domain}.`,
  };
  const ogImages: Record<string, string> = {
    traffic: `${BASE_URL}/api/og?domain=${encodeURIComponent(domain)}&type=traffic`,
    seo: `${BASE_URL}/api/og?domain=${encodeURIComponent(domain)}&type=seo`,
    tech: `${BASE_URL}/api/og?domain=${encodeURIComponent(domain)}&type=tech`,
    business: `${BASE_URL}/api/og?domain=${encodeURIComponent(domain)}&type=business`,
  };
  return {
    title: titles[subPage],
    description: descriptions[subPage],
    alternates: {
      canonical: `/data/${domain}/${subPage}`,
    },
    openGraph: {
      title: `${titles[subPage]} | ${siteName}`,
      description: descriptions[subPage],
      url: `/data/${domain}/${subPage}`,
      type: 'article',
      images: [{
        url: ogImages[subPage],
        width: 1200,
        height: 630,
        alt: `${domain} ${subPage} analysis`,
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
  const display = slug.charAt(0).toUpperCase() + slug.slice(1);
  const label = type === 'technology' ? 'built with' : 'in';
  return {
    title: `Top ${display} Websites — ${type.charAt(0).toUpperCase() + type.slice(1)} Directory`,
    description: `Discover the most popular websites ${label} ${display}. Ranked by traffic, authority, and AI analysis.`,
    alternates: {
      canonical: `/directory/${type}/${slug}`,
    },
    openGraph: {
      title: `Top ${display} Websites — ${type.charAt(0).toUpperCase() + type.slice(1)} Directory | ${siteName}`,
      description: `Discover the most popular websites ${label} ${display}. Ranked by traffic, authority, and AI analysis.`,
      url: `/directory/${type}/${slug}`,
      type: 'website',
      images: [{
        url: `${BASE_URL}/api/og?type=directory&category=${encodeURIComponent(slug)}`,
        width: 1200,
        height: 630,
        alt: `Top ${display} websites directory`,
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Top ${display} Websites | ${siteName}`,
      description: `Discover the most popular websites ${label} ${display}. Ranked by traffic, authority, and AI analysis.`,
      images: [`${BASE_URL}/api/og?type=directory&category=${encodeURIComponent(slug)}`],
    },
  };
};
