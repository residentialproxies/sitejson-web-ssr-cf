import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { DomainHeader } from '@/components/domain/header';
import { NavTabs } from '@/components/domain/nav-tabs';
import { getSiteReport, getSiteProviderSummary } from '@/lib/api-client/client';
import { buildReportMetadata } from '@/lib/seo/metadata';
import {
  generateWebPageJsonLd,
  generateBreadcrumbJsonLd,
  generateDatasetJsonLd,
  combineJsonLd,
} from '@/lib/seo/json-ld';
import { normalizeDomainInput } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { ProviderDataSummary } from '@/components/domain/provider-completeness-summary';

export const runtime = 'edge';

type MetadataProps = {
  params: Promise<{ domain: string }>;
};

export async function generateMetadata({ params }: MetadataProps): Promise<Metadata> {
  const { domain } = await params;
  const normalizedDomain = normalizeDomainInput(domain) || domain;
  return buildReportMetadata(normalizedDomain);
}

type DomainLayoutProps = {
  children: React.ReactNode;
  params: Promise<{
    domain: string;
  }>;
};

export default async function DomainLayout({ children, params }: DomainLayoutProps) {
  const { domain } = await params;
  const normalizedDomain = normalizeDomainInput(domain);
  const canonicalDomain = normalizedDomain || domain;

  if (normalizedDomain && domain !== normalizedDomain) {
    redirect(`/data/${normalizedDomain}`);
    return null;
  }

  const result = await getSiteReport(canonicalDomain);

  if (!result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">?</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            No data for {canonicalDomain}
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            This domain hasn&apos;t been analyzed yet. Start an analysis to generate a report.
          </p>
          <Link href={`/site/${canonicalDomain}`}>
            <Button>Analyze {canonicalDomain}</Button>
          </Link>
        </div>
      </div>
    );
  }

  const providerSummary = await getSiteProviderSummary(canonicalDomain);

  // Generate structured data for the domain report
  const webPageSchema = generateWebPageJsonLd(
    `${canonicalDomain} Website Intelligence Report`,
    `Comprehensive analysis of ${canonicalDomain} including SEO metrics, traffic data, technology stack, and trust signals.`,
    `/data/${canonicalDomain}`,
    result.updatedAt
  );

  const breadcrumbSchema = generateBreadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: canonicalDomain, path: `/data/${canonicalDomain}` },
  ]);

  const datasetSchema = generateDatasetJsonLd(canonicalDomain, result.report);

  const jsonLd = combineJsonLd([webPageSchema, breadcrumbSchema, datasetSchema]);

  return (
    <div className="min-h-screen bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
        <DomainHeader
          domain={canonicalDomain}
          report={result.report}
          updatedAt={result.updatedAt}
          isStale={result.isStale}
        />
        {providerSummary?.providers && providerSummary.providers.length > 0 && (
          <ProviderDataSummary providers={providerSummary.providers} />
        )}
        <NavTabs domain={canonicalDomain} />
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
