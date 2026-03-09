import type { Metadata } from 'next';
import Link from 'next/link';
import { getGlobalInsights } from '@/lib/api-client/client';
import { buildInsightsMetadata } from '@/lib/seo/metadata';

export const runtime = 'edge';

export const metadata: Metadata = buildInsightsMetadata();

const formatNumber = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
};

export default async function InsightsPage() {
  const insights = await getGlobalInsights();

  if (!insights) {
    return (
      <div className="min-h-screen bg-slate-50 py-20">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <h1 className="text-3xl font-semibold text-slate-900">Global Insights</h1>
          <p className="mt-4 text-slate-600">Insights data is not available yet. Analyze more domains first.</p>
          <div className="mt-8">
            <Link href="/directory" className="rounded-full bg-clay-600 px-6 py-3 text-sm font-semibold text-white hover:bg-clay-700">
              Browse Directory
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { totalSites, withTraffic, withScore, scoreDistribution, topCategories, topTechnologies, topTopics } = insights;

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="container mx-auto max-w-5xl space-y-8 px-4">
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-clay-600">Global insights</p>
          <h1 className="mt-3 text-4xl font-semibold text-slate-900 md:text-5xl">
            What the data says across {formatNumber(totalSites)} indexed sites.
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-600">
            Aggregated signals from the full SiteJSON index — traffic coverage, trust scores, and the most common categories, technologies, and topics.
          </p>
        </section>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Total indexed</p>
            <p className="mt-2 text-4xl font-bold text-slate-900">{formatNumber(totalSites)}</p>
            <p className="mt-1 text-sm text-slate-500">unique domains</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">With traffic data</p>
            <p className="mt-2 text-4xl font-bold text-blue-700">{formatNumber(withTraffic)}</p>
            <p className="mt-1 text-sm text-slate-500">
              {totalSites > 0 ? `${Math.round((withTraffic / totalSites) * 100)}%` : '—'} of total
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">With score</p>
            <p className="mt-2 text-4xl font-bold text-emerald-700">{formatNumber(withScore)}</p>
            <p className="mt-1 text-sm text-slate-500">
              {totalSites > 0 ? `${Math.round((withScore / totalSites) * 100)}%` : '—'} of total
            </p>
          </div>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-clay-600 mb-5">Score distribution</p>
          <div className="space-y-4">
            {([
              { label: 'High (70–100)', value: scoreDistribution.high, color: 'bg-emerald-500' },
              { label: 'Medium (40–69)', value: scoreDistribution.medium, color: 'bg-amber-400' },
              { label: 'Low (0–39)', value: scoreDistribution.low, color: 'bg-red-400' },
              { label: 'Unscored', value: scoreDistribution.unscored, color: 'bg-slate-300' },
            ] as const).map((band) => {
              const pct = withScore > 0 ? Math.round((band.value / Math.max(withScore, 1)) * 100) : 0;
              return (
                <div key={band.label}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="text-slate-700 font-medium">{band.label}</span>
                    <span className="text-slate-400">{formatNumber(band.value)} ({pct}%)</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100">
                    <div className={`h-2 rounded-full ${band.color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <div className="grid gap-6 md:grid-cols-3">
          {topCategories.length > 0 && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-600 mb-4">Top categories</p>
              <div className="space-y-2">
                {topCategories.slice(0, 10).map((c, i) => (
                  <Link
                    key={c.slug}
                    href={`/directory/category/${c.slug}`}
                    className="flex items-center justify-between rounded-lg p-2 hover:bg-slate-50 transition-colors"
                  >
                    <span className="text-sm text-slate-700 capitalize">{i + 1}. {c.slug.replace(/-/g, ' ')}</span>
                    <span className="text-xs text-slate-400">{formatNumber(c.count)}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {topTechnologies.length > 0 && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-600 mb-4">Top technologies</p>
              <div className="space-y-2">
                {topTechnologies.slice(0, 10).map((t, i) => (
                  <Link
                    key={t.name}
                    href={`/directory/technology/${t.name}`}
                    className="flex items-center justify-between rounded-lg p-2 hover:bg-slate-50 transition-colors"
                  >
                    <span className="text-sm text-slate-700">{i + 1}. {t.name}</span>
                    <span className="text-xs text-slate-400">{formatNumber(t.count)}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {topTopics.length > 0 && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-600 mb-4">Top topics</p>
              <div className="space-y-2">
                {topTopics.slice(0, 10).map((t, i) => (
                  <Link
                    key={t.name}
                    href={`/directory/topic/${t.name}`}
                    className="flex items-center justify-between rounded-lg p-2 hover:bg-slate-50 transition-colors"
                  >
                    <span className="text-sm text-slate-700">{i + 1}. {t.name}</span>
                    <span className="text-xs text-slate-400">{formatNumber(t.count)}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <p className="text-sm text-slate-600">Explore the full directory</p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Link href="/directory" className="rounded-full border border-slate-200 px-5 py-2 text-sm font-medium text-slate-700 hover:border-clay-300 hover:bg-clay-50">
              All directories
            </Link>
            <Link href="/directory/category" className="rounded-full border border-slate-200 px-5 py-2 text-sm font-medium text-slate-700 hover:border-clay-300 hover:bg-clay-50">
              By category
            </Link>
            <Link href="/directory/technology" className="rounded-full border border-slate-200 px-5 py-2 text-sm font-medium text-slate-700 hover:border-clay-300 hover:bg-clay-50">
              By technology
            </Link>
            <Link href="/directory/topic" className="rounded-full border border-slate-200 px-5 py-2 text-sm font-medium text-slate-700 hover:border-clay-300 hover:bg-clay-50">
              By topic
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
