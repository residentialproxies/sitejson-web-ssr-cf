import React from 'react';
import type { Metadata } from 'next';
import {
  Globe,
  TrendingUp,
  Users,
  Search,
  Clock,
  Calendar,
  Hash,
  FileText,
  MapPin,
  ArrowUpDown,
} from 'lucide-react';
import { getSiteReport, getSiteReportResult } from '@/lib/api-client/client';
import { formatBigNumber, formatDurationHMS, formatNumber } from '@/lib/utils';
import { normalizeTrafficDataForDisplay } from '@/lib/traffic-display';
import { evaluateTrafficSubPageIndexability } from '@/lib/seo/indexability';
import { buildDataSubPageMetadata } from '@/lib/seo/metadata';
import { ReportEmptyState } from '../report-empty-state';
import { SectionGuide } from '@/components/domain/SectionGuide';

export const runtime = 'edge';

type TrafficPageProps = {
  params: Promise<{
    domain: string;
  }>;
};

export async function generateMetadata({ params }: TrafficPageProps): Promise<Metadata> {
  const { domain } = await params;
  const result = await getSiteReportResult(domain);

  if (result.status === 'success') {
    const decision = evaluateTrafficSubPageIndexability(result.data.report);
    return buildDataSubPageMetadata(domain, 'traffic', {
      index: decision.index,
      follow: decision.follow,
    });
  }

  return buildDataSubPageMetadata(domain, 'traffic', {
    index: false,
    follow: result.status !== 'empty',
  });
}

const SOURCE_COLORS: Record<string, string> = {
  direct: 'bg-blue-500',
  search: 'bg-emerald-500',
  social: 'bg-purple-500',
  referral: 'bg-amber-500',
  mail: 'bg-rose-500',
  paid: 'bg-cyan-500',
};

const SOURCE_LABELS: Record<string, string> = {
  direct: 'Direct',
  search: 'Search',
  social: 'Social',
  referral: 'Referrals',
  mail: 'Mail',
  paid: 'Paid Referrals',
};

export default async function TrafficPage({ params }: TrafficPageProps) {
  const { domain } = await params;
  const result = await getSiteReport(domain);
  if (!result) return <ReportEmptyState domain={domain} section="traffic" />;

  const { report } = result;
  const traffic = normalizeTrafficDataForDisplay(report.trafficData);
  const radar = report.radar;
  const whois = traffic?.whois;
  const topRegions = traffic?.topRegions ?? [];
  const topKeywords = traffic?.topKeywords ?? [];
  const trafficSources = traffic?.trafficSources;
  const maxRegionShare = topRegions.length > 0 ? Math.max(1, ...topRegions.map((r) => r.share)) : 1;

  const globalRank = traffic?.globalRank ?? radar?.globalRank;
  const trafficDataPeriod = traffic?.dataYear && traffic?.dataMonth
    ? `${traffic.dataYear}-${traffic.dataMonth}`
    : null;
  const trafficCachedAt = traffic?.cachedAt != null ? formatUnixTimestamp(traffic.cachedAt) : null;
  const radarSourceTime = radar?.sourceTimestamp ? formatDateTime(radar.sourceTimestamp) : null;

  return (
    <div className="space-y-6">
      <SectionGuide section="traffic" />
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          icon={<Globe className="w-4 h-4 text-gray-500" />}
          label="Global Rank"
          value={globalRank != null ? `#${formatNumber(globalRank)}` : '—'}
          sub={radar?.rankBucket}
        />
        <MetricCard
          icon={<Hash className="w-4 h-4 text-gray-500" />}
          label="Country Rank"
          value={traffic?.countryRank != null ? `#${formatNumber(traffic.countryRank)}` : '—'}
          sub={traffic?.topCountry ?? undefined}
        />
        <MetricCard
          icon={<Users className="w-4 h-4 text-gray-500" />}
          label="Total Visits"
          value={traffic?.monthlyVisits != null ? formatBigNumber(traffic.monthlyVisits) : '—'}
          sub="Monthly"
        />
        <MetricCard
          icon={<Clock className="w-4 h-4 text-gray-500" />}
          label="Avg. Duration"
          value={traffic?.avgVisitDuration != null ? formatDurationHMS(traffic.avgVisitDuration) : '—'}
        />
        <MetricCard
          icon={<FileText className="w-4 h-4 text-gray-500" />}
          label="Pages per Visit"
          value={traffic?.pagesPerVisit != null ? traffic.pagesPerVisit.toFixed(2) : '—'}
        />
        <MetricCard
          icon={<TrendingUp className="w-4 h-4 text-gray-500" />}
          label="Bounce Rate"
          value={traffic?.bounceRate != null ? `${traffic.bounceRate.toFixed(2)}%` : '—'}
          valueColor={traffic?.bounceRate != null
            ? traffic.bounceRate < 40 ? 'text-emerald-600' : traffic.bounceRate <= 70 ? 'text-amber-600' : 'text-red-600'
            : undefined}
        />
      </div>

      {/* Domain Information */}
      {(traffic?.domainAgeYears != null || radar?.rankBucket || radar?.categories?.length) && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100">
            <Calendar className="w-4 h-4 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-900">Domain Information</h3>
          </div>
          <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {traffic?.domainAgeYears != null && (
              <InfoItem label="Domain Age" value={`${traffic.domainAgeYears.toFixed(1)} years`} />
            )}
            {radar?.rankBucket && (
              <InfoItem label="Rank Tier" value={radar.rankBucket} />
            )}
            {radar?.categories && radar.categories.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Categories</p>
                <div className="flex flex-wrap gap-1.5">
                  {radar.categories.map((cat) => (
                    <span
                      key={cat}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-700 border border-blue-200"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Data Freshness */}
      {(trafficDataPeriod || trafficCachedAt || radarSourceTime || radar?.queued) && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100">
            <Clock className="w-4 h-4 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-900">Data Freshness</h3>
          </div>
          <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {trafficDataPeriod && (
              <InfoItem label="Traffic Snapshot" value={trafficDataPeriod} />
            )}
            {trafficCachedAt && (
              <InfoItem label="Traffic Cached At" value={trafficCachedAt} />
            )}
            {radarSourceTime && (
              <InfoItem label="Radar Source Time" value={radarSourceTime} />
            )}
            {radar?.queued != null && (
              <InfoItem label="Radar Refresh" value={radar.queued ? 'Queued' : 'Up to date'} />
            )}
          </div>
        </div>
      )}

      {/* Traffic Sources */}
      {trafficSources && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100">
            <ArrowUpDown className="w-4 h-4 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-900">Traffic Sources</h3>
          </div>
          <div className="px-5 py-4 space-y-3">
            {Object.entries(trafficSources)
              .sort(([, a], [, b]) => b - a)
              .map(([key, value]) => (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-sm text-gray-700 w-28 shrink-0">
                    {SOURCE_LABELS[key] ?? key}
                  </span>
                  <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden relative">
                    <div
                      className={`h-full rounded-full ${SOURCE_COLORS[key] ?? 'bg-gray-400'}`}
                      style={{ width: `${Math.max(value, 0.5)}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-16 text-right">
                    {value.toFixed(2)}%
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Top Regions */}
      {topRegions.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100">
            <MapPin className="w-4 h-4 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-900">Top Regions</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {topRegions.map((region, index) => (
              <div key={region.country} className="flex items-center gap-3 px-5 py-3">
                <span className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-500 shrink-0">
                  {index + 1}
                </span>
                <span className="text-sm font-medium text-gray-900 w-40 shrink-0">{region.country}</span>
                {region.countryCode != null && (
                  <span className="text-xs text-gray-400 w-14 shrink-0">#{region.countryCode}</span>
                )}
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${(region.share / maxRegionShare) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-16 text-right">{region.share.toFixed(2)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Keywords */}
      {topKeywords.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100">
            <Search className="w-4 h-4 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-900">Top Keywords</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left text-xs font-medium text-gray-500 px-5 py-2.5 w-10">#</th>
                <th className="text-left text-xs font-medium text-gray-500 px-5 py-2.5">Keyword</th>
                <th className="text-right text-xs font-medium text-gray-500 px-5 py-2.5">Volume</th>
                <th className="text-right text-xs font-medium text-gray-500 px-5 py-2.5">CPC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {topKeywords.map((kw, index) => (
                <tr key={kw.keyword} className="hover:bg-gray-50/50">
                  <td className="px-5 py-3">
                    <span className="w-6 h-6 inline-flex items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-500">
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-medium text-gray-900">{kw.keyword}</td>
                  <td className="px-5 py-3 text-right text-gray-700">{formatBigNumber(kw.volume)}</td>
                  <td className="px-5 py-3 text-right text-gray-700">${kw.cpc.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Whois */}
      {whois && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100">
            <Globe className="w-4 h-4 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-900">Whois</h3>
          </div>
          <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {whois.registrar && (
              <InfoItem label="Registrar" value={whois.registrar} />
            )}
            {whois.createdAt && (
              <InfoItem label="Created At" value={formatDateTime(whois.createdAt)} />
            )}
            {whois.updatedAt && (
              <InfoItem label="Updated At" value={formatDateTime(whois.updatedAt)} />
            )}
            {whois.expiresAt && (
              <InfoItem label="Expires At" value={formatDateTime(whois.expiresAt)} />
            )}
            {whois.nameservers && whois.nameservers.length > 0 && (
              <div className="sm:col-span-2 lg:col-span-3">
                <p className="text-xs text-gray-500 mb-1">Nameservers</p>
                <div className="flex flex-wrap gap-1.5">
                  {whois.nameservers.map((ns) => (
                    <span
                      key={ns}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-50 text-gray-700 border border-gray-200 font-mono"
                    >
                      {ns}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {whois.status && whois.status.length > 0 && (
              <div className="sm:col-span-2 lg:col-span-3">
                <p className="text-xs text-gray-500 mb-1">Status</p>
                <div className="flex flex-wrap gap-1.5">
                  {whois.status.map((status) => (
                    <span
                      key={status}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-700 border border-blue-200"
                    >
                      {status}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  sub,
  valueColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  valueColor?: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
      <div className="flex items-center gap-2 text-gray-500 mb-1.5">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className={`text-2xl font-semibold ${valueColor ?? 'text-gray-900'}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className="text-sm font-medium text-gray-900">{value}</p>
    </div>
  );
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatUnixTimestamp(unixSeconds: number): string {
  if (!Number.isFinite(unixSeconds)) {
    return 'Unknown';
  }
  const date = new Date(unixSeconds * 1000);
  if (Number.isNaN(date.getTime())) {
    return 'Unknown';
  }
  return formatDateTime(date.toISOString());
}
