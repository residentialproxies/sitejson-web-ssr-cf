import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowRightLeft, BarChart3, Layers3, ShieldCheck } from 'lucide-react';
import { getSiteReport } from '@/lib/api-client/client';
import type { SiteReport } from '@/lib/api-client/types';
import { normalizeDomainInput, formatNumber } from '@/lib/utils';
import { buildCompareMetadata } from '@/lib/seo/metadata';
import { generateComparePageJsonLd } from '@/lib/seo/json-ld';
import { buildComparisonSummary, getComparisonFaqs } from '@/lib/pseo';
import { FaqSection } from '@/components/shared/FaqSection';

export const runtime = 'edge';

type ComparePageProps = {
  params: Promise<{
    domainA: string;
    domainB: string;
  }>;
};

export async function generateMetadata({ params }: ComparePageProps): Promise<Metadata> {
  const { domainA, domainB } = await params;
  const a = normalizeDomainInput(decodeURIComponent(domainA));
  const b = normalizeDomainInput(decodeURIComponent(domainB));

  if (!a || !b || a === b) {
    return { robots: { index: false } };
  }

  const [resultA, resultB] = await Promise.all([getSiteReport(a), getSiteReport(b)]);

  if (!resultA || !resultB) {
    return buildCompareMetadata(a, b, { index: false, follow: true });
  }

  const shouldIndex = hasIndexableCompareData(resultA.report, resultB.report);
  return buildCompareMetadata(a, b, { index: shouldIndex, follow: true });
}

type MetricWinner = 'a' | 'b' | 'tie' | 'none';

type CompareRow = {
  label: string;
  valueA: string;
  valueB: string;
  winner: MetricWinner;
};

type CompareCallout = {
  title: string;
  value: string;
  detail: string;
  delta?: string;
  icon: React.ComponentType<{ className?: string }>;
};

function compareHigherBetter(valA?: number | null, valB?: number | null): MetricWinner {
  if (valA == null && valB == null) return 'none';
  if (valA == null) return 'b';
  if (valB == null) return 'a';
  if (valA > valB) return 'a';
  if (valB > valA) return 'b';
  return 'tie';
}

function compareLowerBetter(valA?: number | null, valB?: number | null): MetricWinner {
  if (valA == null && valB == null) return 'none';
  if (valA == null) return 'b';
  if (valB == null) return 'a';
  if (valA < valB) return 'a';
  if (valB < valA) return 'b';
  return 'tie';
}

function winnerClass(winner: MetricWinner, side: 'a' | 'b'): string {
  if (winner === side) return 'bg-green-50 font-semibold text-green-700';
  return '';
}

function formatMetric(value: number | null | undefined, formatter: (v: number) => string): string {
  if (value == null) return '--';
  return formatter(value);
}

function getGlobalRank(report: SiteReport): number | null | undefined {
  return report.radar?.globalRank ?? report.trafficData?.globalRank;
}

function hasIndexableCompareData(reportA: SiteReport, reportB: SiteReport): boolean {
  const sharedQuantitativeSignals = [
    reportA.trafficData?.monthlyVisits != null && reportB.trafficData?.monthlyVisits != null,
    getGlobalRank(reportA) != null && getGlobalRank(reportB) != null,
    reportA.aiAnalysis?.risk?.score != null && reportB.aiAnalysis?.risk?.score != null,
    reportA.trafficData?.bounceRate != null && reportB.trafficData?.bounceRate != null,
    reportA.trafficData?.domainAgeYears != null && reportB.trafficData?.domainAgeYears != null,
  ].filter(Boolean).length;

  const sharedStructuralSignals = [
    Boolean(reportA.taxonomy?.iabCategory && reportB.taxonomy?.iabCategory),
    Boolean((reportA.meta?.techStackDetected?.length ?? 0) > 0 && (reportB.meta?.techStackDetected?.length ?? 0) > 0),
  ].filter(Boolean).length;

  return sharedQuantitativeSignals >= 2 && sharedQuantitativeSignals + sharedStructuralSignals >= 4;
}

function buildCompareRows(reportA: SiteReport, reportB: SiteReport): CompareRow[] {
  const rows: CompareRow[] = [];

  rows.push({
    label: 'Monthly Visits',
    valueA: formatMetric(reportA.trafficData?.monthlyVisits, formatNumber),
    valueB: formatMetric(reportB.trafficData?.monthlyVisits, formatNumber),
    winner: compareHigherBetter(reportA.trafficData?.monthlyVisits, reportB.trafficData?.monthlyVisits),
  });

  const rankA = getGlobalRank(reportA);
  const rankB = getGlobalRank(reportB);
  rows.push({
    label: 'Global Rank',
    valueA: rankA != null ? `#${formatNumber(rankA)}` : '--',
    valueB: rankB != null ? `#${formatNumber(rankB)}` : '--',
    winner: compareLowerBetter(rankA, rankB),
  });

  rows.push({
    label: 'Trust Score',
    valueA: formatMetric(reportA.aiAnalysis?.risk?.score, (v) => `${v}/100`),
    valueB: formatMetric(reportB.aiAnalysis?.risk?.score, (v) => `${v}/100`),
    winner: compareHigherBetter(reportA.aiAnalysis?.risk?.score, reportB.aiAnalysis?.risk?.score),
  });

  rows.push({
    label: 'Category',
    valueA: reportA.taxonomy?.iabCategory ?? '--',
    valueB: reportB.taxonomy?.iabCategory ?? '--',
    winner: 'none',
  });

  const techA = reportA.meta?.techStackDetected ?? [];
  const techB = reportB.meta?.techStackDetected ?? [];
  rows.push({
    label: 'Tech Stack',
    valueA: techA.length > 0 ? techA.slice(0, 4).join(', ') : '--',
    valueB: techB.length > 0 ? techB.slice(0, 4).join(', ') : '--',
    winner: 'none',
  });

  rows.push({
    label: 'Domain Age',
    valueA: formatMetric(reportA.trafficData?.domainAgeYears, (v) => `${v.toFixed(1)} yrs`),
    valueB: formatMetric(reportB.trafficData?.domainAgeYears, (v) => `${v.toFixed(1)} yrs`),
    winner: compareHigherBetter(reportA.trafficData?.domainAgeYears, reportB.trafficData?.domainAgeYears),
  });

  rows.push({
    label: 'Bounce Rate',
    valueA: formatMetric(reportA.trafficData?.bounceRate, (v) => `${v.toFixed(1)}%`),
    valueB: formatMetric(reportB.trafficData?.bounceRate, (v) => `${v.toFixed(1)}%`),
    winner: compareLowerBetter(reportA.trafficData?.bounceRate, reportB.trafficData?.bounceRate),
  });

  return rows;
}

type CompareTally = {
  leader: string;
  measuredSignals: number;
  winsA: number;
  winsB: number;
  ties: number;
};

function buildCompareTally(domainA: string, reportA: SiteReport, domainB: string, reportB: SiteReport): CompareTally {
  const signalWinners = [
    {
      winner: compareHigherBetter(reportA.trafficData?.monthlyVisits, reportB.trafficData?.monthlyVisits),
      comparable: reportA.trafficData?.monthlyVisits != null && reportB.trafficData?.monthlyVisits != null,
    },
    {
      winner: compareLowerBetter(getGlobalRank(reportA), getGlobalRank(reportB)),
      comparable: getGlobalRank(reportA) != null && getGlobalRank(reportB) != null,
    },
    {
      winner: compareHigherBetter(reportA.aiAnalysis?.risk?.score, reportB.aiAnalysis?.risk?.score),
      comparable: reportA.aiAnalysis?.risk?.score != null && reportB.aiAnalysis?.risk?.score != null,
    },
    {
      winner: compareHigherBetter(reportA.trafficData?.domainAgeYears, reportB.trafficData?.domainAgeYears),
      comparable: reportA.trafficData?.domainAgeYears != null && reportB.trafficData?.domainAgeYears != null,
    },
    {
      winner: compareLowerBetter(reportA.trafficData?.bounceRate, reportB.trafficData?.bounceRate),
      comparable: reportA.trafficData?.bounceRate != null && reportB.trafficData?.bounceRate != null,
    },
  ].filter((signal) => signal.comparable);

  const winsA = signalWinners.filter((signal) => signal.winner === 'a').length;
  const winsB = signalWinners.filter((signal) => signal.winner === 'b').length;
  const ties = signalWinners.filter((signal) => signal.winner === 'tie').length;
  const measuredSignals = signalWinners.length;
  const leader = winsA == winsB ? 'Even' : winsA > winsB ? domainA : domainB;

  return { leader, measuredSignals, winsA, winsB, ties };
}

function buildCompareCallouts(domainA: string, reportA: SiteReport, domainB: string, reportB: SiteReport): CompareCallout[] {
  const visitsA = reportA.trafficData?.monthlyVisits ?? null;
  const visitsB = reportB.trafficData?.monthlyVisits ?? null;
  const trustA = reportA.aiAnalysis?.risk?.score ?? null;
  const trustB = reportB.aiAnalysis?.risk?.score ?? null;
  const techA = reportA.meta?.techStackDetected?.length ?? 0;
  const techB = reportB.meta?.techStackDetected?.length ?? 0;
  const tally = buildCompareTally(domainA, reportA, domainB, reportB);

  const trafficWinner = compareHigherBetter(visitsA, visitsB) === 'a' ? domainA : compareHigherBetter(visitsA, visitsB) === 'b' ? domainB : 'Tie';
  const trustWinner = compareHigherBetter(trustA, trustB) === 'a' ? domainA : compareHigherBetter(trustA, trustB) === 'b' ? domainB : 'Tie';
  const stackLeader = techA === techB ? 'Even' : techA > techB ? domainA : domainB;
  const trafficDelta = visitsA != null && visitsB != null ? `Gap: ${formatNumber(Math.abs(visitsA - visitsB))} visits` : 'Gap: incomplete';
  const trustDelta = trustA != null && trustB != null ? `Gap: ${Math.abs(trustA - trustB)} pts` : 'Gap: incomplete';
  const stackDelta = techA !== techB ? `Gap: ${Math.abs(techA - techB)} signal${Math.abs(techA - techB) === 1 ? '' : 's'}` : 'Gap: no measurable spread';
  const tallyDelta = tally.measuredSignals > 0 ? `${tally.measuredSignals} measured signals` : 'No measured signals';

  return [
    {
      title: 'Estimated traffic gap',
      value: trafficWinner,
      delta: trafficDelta,
      detail: visitsA != null && visitsB != null
        ? `${trafficWinner} leads on estimated visits and gives the strongest first read on audience scale.`
        : 'Traffic inputs are incomplete for one or both domains.',
      icon: BarChart3,
    },
    {
      title: 'Trust score comparison',
      value: trustWinner,
      delta: trustDelta,
      detail: trustA != null && trustB != null
        ? `${trustWinner} currently scores better on the measured trust score shown on this page, which is useful for qualification and risk screening.`
        : 'Trust-score inputs are incomplete for one or both domains.',
      icon: ShieldCheck,
    },
    {
      title: 'Detected stack breadth',
      value: stackLeader,
      delta: stackDelta,
      detail: techA !== techB
        ? `${stackLeader} exposes more detected stack signals, which can help with technical benchmarking.`
        : 'Both domains expose a similar number of stack signals, so the detailed report is the better next step.',
      icon: Layers3,
    },
    {
      title: 'Measured signal tally',
      value: tally.leader,
      delta: tallyDelta,
      detail: tally.measuredSignals > 0
        ? `${domainA} leads ${tally.winsA}, ${domainB} leads ${tally.winsB}, and ${tally.ties} measurable signals are tied.`
        : 'There are not enough overlapping measured signals to build a reliable winner tally yet. Treat the table as incomplete.',
      icon: ArrowRightLeft,
    },
  ];
}

function buildNextMoves(domainA: string, reportA: SiteReport, domainB: string, reportB: SiteReport): string[] {
  const categoryA = reportA.taxonomy?.iabCategory;
  const techA = reportA.meta?.techStackDetected?.[0];
  const techB = reportB.meta?.techStackDetected?.[0];

  return [
    `Open ${domainA} if you want the deeper read on ${categoryA?.toLowerCase() ?? 'positioning'}, trust posture, and technology footprint.`,
    `Open ${domainB} if you want to confirm whether its traffic and engagement profile supports the same strategic assumptions.`,
    techA || techB
      ? `Use ${techA ?? techB} as the next pivot into a technology directory if implementation overlap matters to your decision.`
      : 'If implementation overlap matters, move into the individual reports and inspect the technology modules next.',
  ];
}

export default async function ComparePage({ params }: ComparePageProps) {
  const { domainA: rawA, domainB: rawB } = await params;
  const a = normalizeDomainInput(decodeURIComponent(rawA));
  const b = normalizeDomainInput(decodeURIComponent(rawB));

  if (!a || !b || a === b) {
    notFound();
    return null;
  }

  if (a > b) {
    redirect(`/compare/${encodeURIComponent(b)}/vs/${encodeURIComponent(a)}`);
  }

  const [resultA, resultB] = await Promise.all([getSiteReport(a), getSiteReport(b)]);
  const hasBothReports = resultA != null && resultB != null;
  const reportA = resultA?.report;
  const reportB = resultB?.report;
  const faqs = getComparisonFaqs(a, b);
  const shouldIndexCompare = reportA && reportB ? hasIndexableCompareData(reportA, reportB) : false;
  const jsonLd = hasBothReports && shouldIndexCompare ? generateComparePageJsonLd(a, b) : null;
  const rows = buildCompareRows(reportA ?? {}, reportB ?? {});
  const summary = reportA && reportB ? buildComparisonSummary(a, reportA, b, reportB) : null;
  const callouts = reportA && reportB ? buildCompareCallouts(a, reportA, b, reportB) : [];
  const nextMoves = reportA && reportB ? buildNextMoves(a, reportA, b, reportB) : [];

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd }}
        />
      )}
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
        <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-clay-600">Analyst comparison</p>
              <h1 className="mt-3 text-3xl font-bold text-slate-900 md:text-4xl">
                {a} <span className="text-slate-400">vs</span> {b}
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-relaxed text-slate-600">
                Side-by-side website comparison for analysts, SEO operators, and research teams. Use the summary,
                callouts, and metric table together before you move back into the full domain reports.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
              <ArrowRightLeft className="h-4 w-4 text-clay-600" />
              Estimated, measured, and detected signals — not audited figures
            </div>
          </div>
        </section>

        {!hasBothReports && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
            <p className="text-sm font-medium text-amber-800">
              {!resultA && !resultB
                ? `No report data is available for either ${a} or ${b} yet.`
                : `Report data is missing for ${!resultA ? a : b}. This comparison stays visible for users, but it is excluded from search indexing until both reports exist.`}
            </p>
            <p className="mt-2 text-sm text-amber-700">Try analyzing the missing domain first, then return to compare.</p>
          </div>
        )}

        {hasBothReports && !shouldIndexCompare && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
            <p className="text-sm font-medium text-amber-800">
              This comparison is visible to users, but it is excluded from search indexing until both domains expose more overlapping estimated, measured, and detected signals.
            </p>
            <p className="mt-2 text-sm text-amber-700">Open the full reports first, then return once more comparable fields are available.</p>
          </div>
        )}

        {summary && (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">{summary.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{summary.summary}</p>
            <ul className="mt-4 space-y-1">
              {summary.bullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-2 text-sm text-slate-600">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                  {bullet}
                </li>
              ))}
            </ul>
          </section>
        )}

        {callouts.length > 0 && (
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {callouts.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-50 text-clay-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{item.title}</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">{item.value}</p>
                  {item.delta && (
                    <p className="mt-3 inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">{item.delta}</p>
                  )}
                  <p className="mt-3 text-sm leading-6 text-slate-600">{item.detail}</p>
                </article>
              );
            })}
          </section>
        )}

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-clay-600">How to read this table</p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">Estimated rows</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">Traffic and rank rows are directional estimates that help you benchmark scale, not audited figures.</p>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">Measured highlights</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">Green cells mark the stronger measured signal on directly comparable rows. Lower is better for Global Rank and Bounce Rate.</p>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">Incomplete inputs</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">Rows with missing values should be treated as incomplete, not as evidence of parity.</p>
            </article>
          </div>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 text-left font-medium text-slate-600">Metric</th>
                  <th className="px-4 py-3 text-center font-medium text-slate-900">
                    <Link href={`/data/${a}`} className="hover:text-blue-600 hover:underline">{a}</Link>
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-slate-900">
                    <Link href={`/data/${b}`} className="hover:text-blue-600 hover:underline">{b}</Link>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.label} className="border-b border-slate-100 last:border-b-0">
                    <td className="px-4 py-3 font-medium text-slate-700">{row.label}</td>
                    <td className={`px-4 py-3 text-center ${winnerClass(row.winner, 'a')}`}>{row.valueA}</td>
                    <td className={`px-4 py-3 text-center ${winnerClass(row.winner, 'b')}`}>{row.valueB}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {nextMoves.length > 0 && (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-clay-600">Analyst next moves</p>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {nextMoves.map((move) => (
                <article key={move} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm leading-6 text-slate-600">{move}</p>
                </article>
              ))}
            </div>
          </section>
        )}

        <section className="grid gap-4 sm:grid-cols-2">
          <Link href={`/data/${a}`} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md">
            <p className="text-sm font-semibold text-slate-900">{a} Full Report</p>
            <p className="mt-1 text-sm text-slate-500">Open the detailed report for {a}</p>
          </Link>
          <Link href={`/data/${b}`} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md">
            <p className="text-sm font-semibold text-slate-900">{b} Full Report</p>
            <p className="mt-1 text-sm text-slate-500">Open the detailed report for {b}</p>
          </Link>
        </section>

        <FaqSection title="Comparison FAQ" description={`Common questions about comparing ${a} and ${b}.`} items={faqs} />
      </div>
    </>
  );
}
