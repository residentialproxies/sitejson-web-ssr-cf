import React from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import type { DirectoryItem, GlobalInsights } from '@/lib/api-client/types';
import { ArrowRight } from 'lucide-react';
import { DIRECTORY_TYPE_ORDER, DIRECTORY_SEEDS, FEATURED_REPORTS, getDirectoryHubFaqs, type DirectoryType } from '@/lib/pseo';
import { FaqSection } from '@/components/shared/FaqSection';
import { DirectoryPreviewList } from './DirectoryPreviewList';

interface DirectoryHubOverviewProps {
  previews: Record<string, DirectoryItem[]>;
  totals?: Record<string, number>;
  insights?: GlobalInsights | null;
  notice?: string | null;
}

const formatNumber = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
};

const createPreviewItem = (reportIndex: number): DirectoryItem => {
  const report = FEATURED_REPORTS[reportIndex];

  return {
    domain: report.domain,
    title: report.description,
  };
};

const FALLBACK_PREVIEWS: Record<DirectoryType, DirectoryItem[]> = {
  category: [createPreviewItem(0), createPreviewItem(1), createPreviewItem(2)],
  technology: [createPreviewItem(3), createPreviewItem(0), createPreviewItem(2)],
  topic: [createPreviewItem(1), createPreviewItem(0), createPreviewItem(3)],
};

export function DirectoryHubOverview({ previews, totals, insights, notice }: DirectoryHubOverviewProps) {
  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="container mx-auto max-w-7xl space-y-8 px-4 md:px-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-clay-600">Directory hub</p>
          <h1 className="mt-3 text-4xl font-semibold text-slate-900 md:text-5xl">Browse websites the way people actually investigate them.</h1>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-600">
            Start from a market, a technology stack, or a topic. Each path leads into live report pages with traffic,
            SEO, business, and trust signals that are easier to act on than a plain lookup table.
          </p>
          {notice && (
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              {notice}
            </div>
          )}
          {insights && insights.totalSites > 0 && (
            <div className="mt-6 flex flex-wrap gap-4">
              <span className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700">
                {formatNumber(insights.totalSites)} sites indexed
              </span>
              {insights.withTraffic > 0 && (
                <span className="rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
                  {formatNumber(insights.withTraffic)} with traffic data
                </span>
              )}
              <Link
                href={'/insights' as Route}
                className="rounded-full border border-clay-200 bg-clay-50 px-4 py-2 text-sm font-medium text-clay-700 hover:bg-clay-100"
              >
                View global insights →
              </Link>
            </div>
          )}
        </section>

        <section className="grid gap-6 xl:grid-cols-3">
          {DIRECTORY_TYPE_ORDER.map((type) => {
            const seed = DIRECTORY_SEEDS[type];
            const previewItems = previews[type]?.length ? previews[type] : FALLBACK_PREVIEWS[type];
            const usingFallbackPreview = (previews[type]?.length ?? 0) === 0;
            const total = totals?.[type];
            return (
              <article key={type} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-600">{seed.label}</p>
                    <h2 className="mt-2 text-2xl font-semibold text-slate-900">{seed.title}</h2>
                    {typeof total === 'number' && total > 0 && (
                      <span className="mt-1 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
                        {formatNumber(total)} sites
                      </span>
                    )}
                  </div>
                  <Link href={`/directory/${type}`} className="inline-flex items-center gap-2 text-sm font-semibold text-clay-700 hover:text-clay-800">
                    Open hub <ArrowRight size={16} />
                  </Link>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-slate-600">{seed.description}</p>
                <p className="mt-3 text-sm font-medium text-slate-700">{seed.intent}</p>
                <div className="mt-6">
                  {usingFallbackPreview && (
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Curated live examples while fresh rollups reload
                    </p>
                  )}
                  <DirectoryPreviewList items={previewItems} />
                </div>
              </article>
            );
          })}
        </section>

        <FaqSection
          title="How to use the directory hub"
          description="The hub is meant to shorten the path from broad curiosity to a specific, high-intent report page."
          items={getDirectoryHubFaqs()}
        />
      </div>
    </div>
  );
}
