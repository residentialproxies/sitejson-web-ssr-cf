import React from 'react';
import Link from 'next/link';
import type { DirectoryItem } from '@/lib/api-client/types';
import type { DirectoryTypeSummary } from '@/lib/api-client/types';
import type { DirectoryType } from '@/lib/pseo';
import { ArrowRight } from 'lucide-react';
import { getDirectorySeed, getDirectoryTypeFaqs } from '@/lib/pseo';
import { FaqSection } from '@/components/shared/FaqSection';
import { DirectoryPreviewList } from './DirectoryPreviewList';

interface DirectoryTypeHubProps {
  type: DirectoryType;
  items: DirectoryItem[];
  summary?: DirectoryTypeSummary | null;
  notice?: string | null;
}

const formatNumber = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
};

export function DirectoryTypeHub({ type, items, summary, notice }: DirectoryTypeHubProps) {
  const seed = getDirectorySeed(type);

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="container mx-auto max-w-7xl space-y-8 px-4 md:px-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:p-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-clay-600">{seed.label}</p>
              <h1 className="mt-3 text-4xl font-semibold text-slate-900 md:text-5xl">{seed.title}</h1>
              <p className="mt-4 text-lg leading-relaxed text-slate-600">{seed.description}</p>
              <p className="mt-4 text-sm font-medium text-slate-700">{seed.intent}</p>
              {notice && (
                <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  {notice}
                </div>
              )}
              {summary && (
                <p className="mt-3 text-sm text-slate-400">
                  {formatNumber(summary.totalSlugs)} {type === 'category' ? 'categories' : type === 'technology' ? 'technologies' : 'topics'} · {formatNumber(summary.totalSites)} total sites indexed
                </p>
              )}
            </div>
            <Link href={`/directory/${type}/${seed.slug}`} className="inline-flex items-center gap-2 text-sm font-semibold text-clay-700 hover:text-clay-800">
              Open featured live page <ArrowRight size={16} />
            </Link>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-600">Featured example</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">/{type}/{seed.slug}</h2>
              </div>
              <Link href={`/directory/${type}/${seed.slug}`} className="text-sm font-semibold text-clay-700 hover:text-clay-800">
                View all results
              </Link>
            </div>
            <div className="mt-6">
              <DirectoryPreviewList items={items} />
            </div>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-600">How to use this hub</p>
            <ul className="mt-4 space-y-4 text-sm leading-relaxed text-slate-600">
              <li>Open the featured page first to see live results without guessing which slug is active.</li>
              <li>Use the domain reports to validate scale, trust, and technical posture before taking action.</li>
              <li>Pivot into another browse path when you need market context instead of a single stack or niche.</li>
            </ul>
          </article>
        </section>

        {summary && summary.slugs.length > 0 && (
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4 mb-5">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-clay-600">
                Browse all {type === 'category' ? 'categories' : type === 'technology' ? 'technologies' : 'topics'}
              </p>
              <span className="text-xs text-slate-400">{formatNumber(summary.totalSlugs)} total</span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {summary.slugs.map((s) => (
                <Link
                  key={s.slug}
                  href={`/directory/${type}/${s.slug}`}
                  className="group rounded-2xl border border-slate-200 bg-slate-50 p-3 hover:border-clay-300 hover:bg-clay-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-1">
                    <p className="text-sm font-semibold text-slate-800 group-hover:text-clay-700 leading-tight capitalize">
                      {s.slug.replace(/-/g, ' ')}
                    </p>
                    <span className="shrink-0 rounded-full bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                      {formatNumber(s.count)}
                    </span>
                  </div>
                  {s.topDomain && (
                    <p className="mt-1 text-xs text-slate-400 truncate">{s.topDomain}</p>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        <FaqSection
          title={`Questions about ${seed.label.toLowerCase()}`}
          description="These hub pages are meant to reduce friction and help visitors understand when this browse path is the right starting point."
          items={getDirectoryTypeFaqs(type)}
        />
      </div>
    </div>
  );
}
