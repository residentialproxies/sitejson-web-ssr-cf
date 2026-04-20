import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { DomainHeader } from '@/components/domain/header';
import { NavTabs } from '@/components/domain/nav-tabs';
import { ExecutiveSummary } from '@/components/domain/ExecutiveSummary';
import { RelatedResources } from '@/components/domain/RelatedResources';
import { ProviderDataSummary } from '@/components/domain/provider-completeness-summary';
import { getSiteAlternatives, getSiteProviderSummary, getSiteReportResult } from '@/lib/api-client/client';
import { evaluateReportIndexability } from '@/lib/seo/indexability';
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
  const result = await getSiteReportResult(normalizedDomain);

  if (result.status === 'success') {
    const decision = evaluateReportIndexability(result.data.report);
    return buildReportMetadata(
      normalizedDomain,
      { traffic: result.data.report.trafficData?.monthlyVisits ?? undefined },
      { index: decision.index, follow: decision.follow },
    );
  }

  if (result.status === 'empty') {
    return buildReportMetadata(normalizedDomain, undefined, { index: false, follow: false });
  }

  // Keep metadata stable (and indexable) when upstream is temporarily unavailable to avoid flapping
  // robots directives across requests.
  return buildReportMetadata(normalizedDomain);
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

  const result = await getSiteReportResult(canonicalDomain);

  if (result.status === 'empty') {
    notFound();
    return null;
  }

  if (result.status !== 'success') {
    return children;
  }

  const providerSummary = await getSiteProviderSummary(canonicalDomain);
  const alternatives = await getSiteAlternatives(canonicalDomain);
  const alternativeItems = alternatives?.items ?? [];
  const relatedItems = [
    ...getReportDirectoryLinks(result.data.report),
    ...getAlternativeLinks(alternativeItems),
    ...alternativeItems.slice(0, 3).map((alternative) => ({
      href: `/compare/${canonicalDomain}/vs/${alternative.domain}`,
      label: `Compare ${canonicalDomain} vs ${alternative.domain}`,
      description: alternative.reasons?.[0] ?? `See the side-by-side comparison between ${canonicalDomain} and ${alternative.domain}.`,
    })),
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
  const jsonLd = generateDataPageJsonLd({ domain: canonicalDomain, report: result.data.report });

  return (
    <div className="min-h-screen bg-gray-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <div className="mx-auto max-w-7xl space-y-4 px-4 py-6">
        <DomainHeader
          domain={canonicalDomain}
          report={result.data.report}
          updatedAt={result.data.updatedAt}
          isStale={result.data.isStale}
        />
        <ExecutiveSummary domain={canonicalDomain} report={result.data.report} />
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
