import React from 'react';
import type { DirectoryStats } from '@/lib/api-client/types';

interface DirectoryStatsPanelProps {
  stats: DirectoryStats;
}

const scoreColor = (score: number | null): string => {
  if (score === null) return 'bg-slate-300';
  if (score >= 70) return 'bg-emerald-500';
  if (score >= 40) return 'bg-amber-400';
  return 'bg-red-400';
};

const formatNumber = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
};

const getCoverageLabel = (ratio: number): string => {
  if (ratio >= 0.6) return 'broad coverage';
  if (ratio >= 0.25) return 'moderate coverage';
  if (ratio > 0) return 'thin coverage';
  return 'no traffic coverage yet';
};

const getQualityPosture = (score: number | null): string => {
  if (score === null) return 'unclear quality posture';
  if (score >= 70) return 'strong quality posture';
  if (score >= 45) return 'mixed quality posture';
  return 'weaker quality posture';
};

export function DirectoryStatsPanel({ stats }: DirectoryStatsPanelProps) {
  const { total, avgLegitimacyScore, trafficDistribution, topTechnologies, topTags, topCountries, hasTrafficData } = stats;
  const avgPct = avgLegitimacyScore !== null ? Math.min(100, avgLegitimacyScore) : 0;
  const coverageRatio = total > 0 ? hasTrafficData / total : 0;
  const coverageLabel = getCoverageLabel(coverageRatio);
  const qualityPosture = getQualityPosture(avgLegitimacyScore);
  const topTech = topTechnologies.slice(0, 5);
  const topTagsSlice = topTags.slice(0, 5);
  const topCountriesSlice = topCountries.slice(0, 3);

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-600">Aggregate stats</p>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-4xl font-bold text-slate-900">{formatNumber(total)}</span>
          <span className="text-sm text-slate-500">indexed sites</span>
        </div>
        <p className="mt-1 text-xs text-slate-400">
          {hasTrafficData > 0 ? `${formatNumber(hasTrafficData)} with traffic data` : 'No traffic observations yet'} — {coverageLabel} for prioritization.
        </p>
      </section>

      {avgLegitimacyScore !== null && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-600">Avg legitimacy score</p>
          <div className="mt-3 flex items-center gap-3">
            <span className="text-3xl font-bold text-slate-900">{avgLegitimacyScore}</span>
            <span className="text-sm text-slate-400">/ 100</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">{qualityPosture} across currently indexed sites.</p>
          <div className="mt-2 h-2 w-full rounded-full bg-slate-100">
            <div
              className={`h-2 rounded-full transition-all ${scoreColor(avgLegitimacyScore)}`}
              style={{ width: `${avgPct}%` }}
            />
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-600">Traffic rank distribution</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {trafficDistribution.top10k > 0 && (
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
              Top 10K: {trafficDistribution.top10k}
            </span>
          )}
          {trafficDistribution.top100k > 0 && (
            <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
              Top 100K: {trafficDistribution.top100k}
            </span>
          )}
          {trafficDistribution.top1m > 0 && (
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
              Top 1M: {trafficDistribution.top1m}
            </span>
          )}
          {trafficDistribution.unranked > 0 && (
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-400">
              Unranked: {trafficDistribution.unranked}
            </span>
          )}
        </div>
      </section>

      {topTech.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-600">Top technologies</p>
          <p className="mt-2 text-xs text-slate-400">Detected technology signals in this filtered cluster, not universal market share.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {topTech.map((t) => (
              <span key={t.name} className="flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-700">
                {t.name}
                <span className="rounded-full bg-teal-200 px-1.5 text-[10px] font-bold">{t.count}</span>
              </span>
            ))}
          </div>
        </section>
      )}

      {topTagsSlice.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-600">Top topics</p>
          <p className="mt-2 text-xs text-slate-400">Detected topical signals in this filtered cluster.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {topTagsSlice.map((t) => (
              <span key={t.name} className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                {t.name}
                <span className="rounded-full bg-emerald-200 px-1.5 text-[10px] font-bold">{t.count}</span>
              </span>
            ))}
          </div>
        </section>
      )}

      {topCountriesSlice.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay-600">Top countries</p>
          <div className="mt-3 divide-y divide-slate-100">
            {topCountriesSlice.map((c, i) => (
              <div key={c.country} className="flex items-center justify-between py-1.5 text-sm">
                <span className="text-slate-700 font-medium">
                  {i + 1}. {c.country}
                </span>
                <span className="text-xs text-slate-400">{c.count} sites</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
