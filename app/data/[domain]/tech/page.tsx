import React from 'react';
import type { Metadata } from 'next';
import {
  Server,
  Globe,
  Cpu,
  Mail,
  Shield,
  FileText,
  Activity,
  Clock,
  Code,
  Tag,
} from 'lucide-react';
import { DataCard, DataRow, StatusBadge, TagList } from '@/components/domain/data-card';
import { getSiteReport, getSiteReportResult } from '@/lib/api-client/client';
import { cn } from '@/lib/utils';
import { evaluateTechSubPageIndexability } from '@/lib/seo/indexability';
import { buildDataSubPageMetadata } from '@/lib/seo/metadata';
import { ReportEmptyState } from '../report-empty-state';
import { SectionGuide } from '@/components/domain/SectionGuide';

export const runtime = 'edge';

type TechPageProps = {
  params: Promise<{
    domain: string;
  }>;
};

export async function generateMetadata({ params }: TechPageProps): Promise<Metadata> {
  const { domain } = await params;
  const result = await getSiteReportResult(domain);

  if (result.status === 'success') {
    const decision = evaluateTechSubPageIndexability(result.data.report);
    return buildDataSubPageMetadata(domain, 'tech', {
      index: decision.index,
      follow: decision.follow,
    });
  }

  return buildDataSubPageMetadata(domain, 'tech', {
    index: false,
    follow: result.status !== 'empty',
  });
}

export default async function TechPage({ params }: TechPageProps) {
  const { domain } = await params;
  const result = await getSiteReport(domain);
  if (!result) return <ReportEmptyState domain={domain} section="technology" />;

  const { report } = result;
  const techStack = report.meta?.techStackDetected ?? [];
  const dns = report.dns;
  const files = report.files;
  const radar = report.radar;
  const providerHealth = report.providerHealth;
  const timing = report._meta?.timing;
  const html = report._meta?.html;

  return (
    <div className="space-y-6">
      <SectionGuide section="tech" />
      {/* Tech Stack Section */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-gray-500" />
          Technology Stack
        </h2>
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
          {techStack.length > 0 ? (
            <TagList tags={techStack} />
          ) : (
            <p className="text-sm text-gray-500">No technologies detected.</p>
          )}
        </div>
      </section>

      {/* DNS & Infrastructure */}
      {dns && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Server className="w-5 h-5 text-gray-500" />
            Infrastructure
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DataCard title="DNS Provider" icon={<Globe className="w-4 h-4 text-gray-500" />}>
              <DataRow label="Provider" value={dns.provider ?? 'Unknown'} />
            </DataCard>

            {dns.mxRecords && dns.mxRecords.length > 0 && (
              <DataCard title="Mail Exchange" icon={<Mail className="w-4 h-4 text-gray-500" />}>
                {dns.mxRecords.map((mx, i) => (
                  <DataRow key={mx} label={`MX ${i + 1}`} value={mx} mono />
                ))}
              </DataCard>
            )}

            {dns.nsRecords && dns.nsRecords.length > 0 && (
              <DataCard title="NS Records" icon={<Shield className="w-4 h-4 text-gray-500" />}>
                {dns.nsRecords.map((ns, i) => (
                  <DataRow key={ns} label={`NS ${i + 1}`} value={ns} mono />
                ))}
              </DataCard>
            )}

            {dns.txtRecords && dns.txtRecords.length > 0 && (
              <DataCard title="TXT Records" icon={<FileText className="w-4 h-4 text-gray-500" />}>
                {dns.txtRecords.map((txt) => (
                  <div key={txt} className="py-2 border-b border-gray-100 last:border-0">
                    <p className="text-xs font-mono break-all text-gray-700">{txt}</p>
                  </div>
                ))}
              </DataCard>
            )}
          </div>
        </section>
      )}

      {/* Technical Files */}
      {files && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-500" />
            Technical Files
          </h2>
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DataCard title="Robots" icon={<FileText className="w-4 h-4 text-gray-500" />}>
                <DataRow
                  label="robots.txt"
                  value={<StatusBadge status={files.hasRobots ?? false} trueLabel="Found" falseLabel="Missing" />}
                />
              </DataCard>
              <DataCard title="Sitemap" icon={<FileText className="w-4 h-4 text-gray-500" />}>
                <DataRow
                  label="sitemap.xml"
                  value={<StatusBadge status={files.hasSitemap ?? false} trueLabel="Found" falseLabel="Missing" />}
                />
              </DataCard>
            </div>
            {files.robotsSitemapUrls && files.robotsSitemapUrls.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-2">Sitemap URLs</p>
                <div className="space-y-1">
                  {files.robotsSitemapUrls.map((url) => (
                    <a
                      key={url}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-xs text-blue-600 hover:underline truncate"
                    >
                      {url}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Cloudflare Radar Categories */}
      {radar && (radar.categories?.length || radar.rankBucket) && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Tag className="w-5 h-5 text-gray-500" />
            Cloudflare Radar
          </h2>
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 space-y-3">
            {radar.rankBucket && (
              <div>
                <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                  Rank: {radar.rankBucket}
                </span>
              </div>
            )}
            {radar.categories && radar.categories.length > 0 && (
              <TagList tags={radar.categories} />
            )}
          </div>
        </section>
      )}

      {/* Provider Health Grid */}
      {providerHealth && providerHealth.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Activity className="w-5 h-5 text-gray-500" />
            Provider Health
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {providerHealth.map((ph) => (
              <div
                key={ph.provider}
                className="bg-white border border-gray-200 rounded-lg shadow-sm p-3 flex items-center gap-3"
              >
                <span
                  className={cn(
                    'w-2.5 h-2.5 rounded-full flex-shrink-0',
                    ph.ok ? 'bg-emerald-500' : 'bg-red-500',
                  )}
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{ph.provider}</p>
                  {ph.errorCode && (
                    <p className="text-xs text-red-600 truncate">{ph.errorCode}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Performance Metrics */}
      {timing && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-500" />
            Performance Metrics
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {timing.lane_browser_ms != null && (
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">{timing.lane_browser_ms}<span className="text-sm font-normal text-gray-500">ms</span></p>
                <p className="text-xs text-gray-500 mt-1">Browser</p>
              </div>
            )}
            {timing.lane_fetch_ms != null && (
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">{timing.lane_fetch_ms}<span className="text-sm font-normal text-gray-500">ms</span></p>
                <p className="text-xs text-gray-500 mt-1">Fetch</p>
              </div>
            )}
            {timing.lane_ai_ms != null && (
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">{timing.lane_ai_ms}<span className="text-sm font-normal text-gray-500">ms</span></p>
                <p className="text-xs text-gray-500 mt-1">AI</p>
              </div>
            )}
            {timing.total_ms != null && (
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">{timing.total_ms}<span className="text-sm font-normal text-gray-500">ms</span></p>
                <p className="text-xs text-gray-500 mt-1">Total</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* HTML Source Info */}
      {html && (
        <section>
          <DataCard title="HTML Source Info" icon={<Code className="w-4 h-4 text-gray-500" />}>
            {html.source && (
              <DataRow label="Source Method" value={html.source} />
            )}
            {html.length != null && (
              <DataRow label="HTML Size" value={`${(html.length / 1024).toFixed(1)} KB`} />
            )}
            {html.primary_h1 && (
              <DataRow label="Primary H1" value={html.primary_h1} />
            )}
          </DataCard>
        </section>
      )}
    </div>
  );
}
