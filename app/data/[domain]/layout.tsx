import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { DomainHeader } from '@/components/domain/header';
import { NavTabs } from '@/components/domain/nav-tabs';
import { ExecutiveSummary } from '@/components/domain/ExecutiveSummary';
import { RelatedResources } from '@/components/domain/RelatedResources';
import { ProviderDataSummary } from '@/components/domain/provider-completeness-summary';
import { getSiteAlternatives, getSiteProviderSummary, getSiteReport } from '@/lib/api-client/client';
import { buildReportMetadata } from '@/lib/seo/metadata';
import { generateDataPageJsonLd } from '@/lib/seo/json-ld';
import { getAlternativeLinks, getReportDirectoryLinks } from '@/lib/pseo';
import { normalizeDomainInput } from '@/lib/utils';

export const runtime = 'edge';

type MetadataProps = {
  params: Promise<{ domain: string }>;
};

export async function generateMetadata({ params }: MetadataProps): Promise<Metadata> {
  const { domain } = await params;
  const normalizedDomain = normalizeDomainInput(domain) || domain;
  const result = await getSiteReport(normalizedDomain);

  if (!result) {
    return buildReportMetadata(normalizedDomain, undefined, { index: false, follow: false });
  }

  return buildReportMetadata(normalizedDomain, { traffic: result.report.trafficData?.monthlyVisits ?? undefined });
}

type DomainLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ domain: string }>;
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
    notFound();
    return null;
  }

  const providerSummary = await getSiteProviderSummary(canonicalDomain);
  const alternatives = await getSiteAlternatives(canonicalDomain);
  const alternativeItems = alternatives?.items ?? [];
  const relatedItems = [
    ...getReportDirectoryLinks(result.report),
    ...getAlternativeLinks(alternativeItems),
    ...(alternativeItems.length > 4
      ? [
          {
            href: `/data/${canonicalDomain}/alternatives`,
            label: 'See all alternatives',
            description: `View all ${alternativeItems.length} alternatives and competitors to ${canonicalDomain}.`,
          },
        ]
      : []),
  ].slice(0, 8);
  const jsonLd = generateDataPageJsonLd({ domain: canonicalDomain, report: result.report });

  return (
    <div className="min-h-screen bg-gray-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <div className="mx-auto max-w-7xl space-y-4 px-4 py-6">
        <DomainHeader
          domain={canonicalDomain}
          report={result.report}
          updatedAt={result.updatedAt}
          isStale={result.isStale}
        />
        <ExecutiveSummary domain={canonicalDomain} report={result.report} />
        {providerSummary?.providers && providerSummary.providers.length > 0 && (
          <ProviderDataSummary providers={providerSummary.providers} />
        )}
        <NavTabs domain={canonicalDomain} />
        <div className="mt-4 space-y-6">
          {children}
          <RelatedResources
            title="Keep exploring from this report"
            description="Good pSEO pages should not strand the visitor. These links keep the journey moving through adjacent directories and comparable live reports."
            items={relatedItems}
          />
          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center text-sm text-slate-500 shadow-sm">
            Need fresh data for another site?{' '}
            <Link href={`/site/${canonicalDomain}`} className="font-semibold text-clay-700 hover:text-clay-800">
              Trigger a fresh analysis
            </Link>
            {' '}or open the directory to continue browsing.
          </div>
        </div>
      </div>
    </div>
  );
}
