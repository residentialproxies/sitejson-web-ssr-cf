import React from 'react';
import type { DirectoryItem, DirectoryStats } from '@/lib/api-client/types';

interface DirectoryClusterTakeawaysProps {
  label: string;
  items: DirectoryItem[];
  stats?: DirectoryStats | null;
}

function formatPercent(value: number, total: number): string {
  if (!total) return '0%';
  return `${Math.round((value / total) * 100)}%`;
}

function getSignalStrength(count: number | undefined, total: number | undefined): 'dominant' | 'moderate' | 'thin' {
  if (!count || !total) return 'thin';
  const share = count / total;
  if (share >= 0.35) return 'dominant';
  if (share >= 0.15) return 'moderate';
  return 'thin';
}

function getQualityPosture(score: number | null | undefined): string {
  if (score == null) return 'unclear quality posture';
  if (score >= 70) return 'strong quality posture';
  if (score >= 45) return 'mixed quality posture';
  return 'weaker quality posture';
}

function getCoverageLabel(coverageRatio: number): string {
  if (coverageRatio >= 0.6) return 'broad coverage';
  if (coverageRatio >= 0.25) return 'moderate coverage';
  if (coverageRatio > 0) return 'thin coverage';
  return 'no traffic coverage yet';
}

export function DirectoryClusterTakeaways({ label, items, stats = null }: DirectoryClusterTakeawaysProps) {
  const topDomain = items[0]?.domain;
  const secondDomain = items[1]?.domain;
  const avgScore = stats?.avgLegitimacyScore;
  const coverageRatio = stats && stats.total > 0 ? stats.hasTrafficData / stats.total : 0;
  const trafficCoverage = stats ? formatPercent(stats.hasTrafficData, stats.total) : null;
  const coverageLabel = getCoverageLabel(coverageRatio);
  const topTechnology = stats?.topTechnologies[0]?.name;
  const topTechnologyStrength = getSignalStrength(stats?.topTechnologies[0]?.count, stats?.total);
  const topTopic = stats?.topTags[0]?.name;
  const topTopicStrength = getSignalStrength(stats?.topTags[0]?.count, stats?.total);

  const takeaways = [
    topDomain
      ? {
          title: 'Fastest representative example',
          body: `${topDomain}${secondDomain ? ` and ${secondDomain}` : ''} are the quickest live reports to open when you need to understand the ${label} cluster.`,
        }
      : null,
    avgScore !== null && avgScore !== undefined
      ? {
          title: 'Trust baseline',
          body: `The average legitimacy score is ${avgScore}/100, which suggests a ${getQualityPosture(avgScore)} across this cluster before you open individual reports.`,
        }
      : null,
    trafficCoverage
      ? {
          title: 'Traffic coverage',
          body: `${trafficCoverage} of indexed sites in this cluster already have traffic data, which gives you ${coverageLabel} for cluster-level prioritization instead of pure guesswork.`,
        }
      : null,
    topTechnology
      ? {
          title: 'Dominant technology signal',
          body: `${topTechnology} shows a ${topTechnologyStrength} recurring technology signal in this cluster, so treat it as a useful pivot rather than a universal pattern.`,
        }
      : null,
    topTopic
      ? {
          title: 'Audience/topic signal',
          body: `${topTopic} shows a ${topTopicStrength} recurring topical signal here, which helps explain where adjacent niche pages and compare opportunities should go next.`,
        }
      : null,
  ].filter(Boolean) as Array<{ title: string; body: string }>;

  if (takeaways.length === 0) {
    return null;
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-clay-600">Cluster takeaways</p>
      <h2 className="mt-2 text-2xl font-semibold text-slate-900">What stands out in {label}</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {takeaways.map((item) => (
          <article key={item.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{item.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
