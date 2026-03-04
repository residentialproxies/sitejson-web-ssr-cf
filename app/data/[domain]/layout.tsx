import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { DomainHeader } from '@/components/domain/header';
import { NavTabs } from '@/components/domain/nav-tabs';
import { getSiteReport } from '@/lib/api-client/client';
import { buildReportMetadata } from '@/lib/seo/metadata';
import {
  generateWebPageJsonLd,
  generateBreadcrumbJsonLd,
  generateDatasetJsonLd,
  combineJsonLd,
} from '@/lib/seo/json-ld';
import { Button } from '@/components/ui/Button';

export const runtime = 'edge';

type MetadataProps = {
  params: Promise<{ domain: string }>;
};

export async function generateMetadata({ params }: MetadataProps): Promise<Metadata> {
  const { domain } = await params;
  return buildReportMetadata(domain);
}

type DomainLayoutProps = {
  children: React.ReactNode;
  params: Promise<{
    domain: string;
  }>;
};

export default async function DomainLayout({ children, params }: DomainLayoutProps) {
  const { domain } = await params;
  const result = await getSiteReport(domain);

  if (!result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">?</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            No data for {domain}
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            This domain hasn&apos;t been analyzed yet. Start an analysis to generate a report.
          </p>
          <Link href={`/site/${domain}`}>
            <Button>Analyze {domain}</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Generate structured data for the domain report
  const webPageSchema = generateWebPageJsonLd(
    `${domain} Website Intelligence Report`,
    `Comprehensive analysis of ${domain} including SEO metrics, traffic data, technology stack, and trust signals.`,
    `/data/${domain}`,
    result.updatedAt
  );

  const breadcrumbSchema = generateBreadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: domain, path: `/data/${domain}` },
  ]);

  const datasetSchema = generateDatasetJsonLd(domain, result.report);

  const jsonLd = combineJsonLd([webPageSchema, breadcrumbSchema, datasetSchema]);

  return (
    <div className="min-h-screen bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
        <DomainHeader
          domain={domain}
          report={result.report}
          updatedAt={result.updatedAt}
          isStale={result.isStale}
        />
        <NavTabs domain={domain} />
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
