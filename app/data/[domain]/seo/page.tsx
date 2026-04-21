import React from 'react';
import type { Metadata } from 'next';
import { FileText, Bot, CircleCheck as CheckCircle2, Circle as XCircle, CircleAlert as AlertCircle, Link as LinkIcon, Heading1, Layers } from 'lucide-react';
import { DataCard, DataRow, StatusBadge, ScoreBadge, TagList } from '@/components/domain/data-card';
import { getSiteReport, getSiteReportResult } from '@/lib/api-client/client';
import { cn } from '@/lib/utils';
import { evaluateSeoSubPageIndexability } from '@/lib/seo/indexability';
import { buildDataSubPageMetadata } from '@/lib/seo/metadata';
import { ReportEmptyState } from '../report-empty-state';
import { SectionGuide } from '@/components/domain/SectionGuide';

export const runtime = 'edge';

type SeoPageProps = {
  params: Promise<{
    domain: string;
  }>;
};

export async function generateMetadata({ params }: SeoPageProps): Promise<Metadata> {
  const { domain } = await params;
  const result = await getSiteReportResult(domain);

  if (result.status === 'success') {
    const decision = evaluateSeoSubPageIndexability(result.data.report);
    return buildDataSubPageMetadata(domain, 'seo', {
      index: decision.index,
      follow: decision.follow,
    });
  }

  return buildDataSubPageMetadata(domain, 'seo', {
    index: false,
    follow: result.status !== 'empty',
  });
}

interface ChecklistItemProps {
  label: string;
  status: 'pass' | 'fail' | 'warning';
  description?: string;
}

function ChecklistItem({ label, status, description }: ChecklistItemProps) {
  const icons = {
    pass: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
    fail: <XCircle className="w-4 h-4 text-red-500" />,
    warning: <AlertCircle className="w-4 h-4 text-amber-500" />,
  };

  const bgColors = {
    pass: 'bg-emerald-50 border-emerald-100',
    fail: 'bg-red-50 border-red-100',
    warning: 'bg-amber-50 border-amber-100',
  };

  return (
    <div className={cn('flex items-start gap-3 p-3 rounded-lg border', bgColors[status])}>
      <div className="flex-shrink-0 mt-0.5">{icons[status]}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
    </div>
  );
}

export default async function SeoPage({ params }: SeoPageProps) {
  const { domain } = await params;
  const result = await getSiteReport(domain);
  if (!result) return <ReportEmptyState domain={domain} section="SEO" />;

  const { report } = result;
  const seo = report.seo;
  const files = report.files;
  const ai = report.aiAnalysis;
  const taxonomy = report.taxonomy;
  const h1Count = seo?.h1Count ?? 0;

  return (
    <div className="space-y-6">
      <SectionGuide section="seo" />
      {/* Heading & Links */}
      {seo && (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DataCard title="Heading Structure" icon={<Heading1 className="w-4 h-4 text-gray-500" />}>
            <DataRow
              label="H1 Tags"
              value={
                <span className={cn('font-medium', h1Count === 1 ? 'text-emerald-600' : 'text-amber-600')}>
                  {h1Count}
                </span>
              }
            />
            <DataRow label="H2 Tags" value={seo.h2Count ?? 0} />
            <DataRow label="Images" value={seo.imagesCount ?? 0} />
          </DataCard>

          <DataCard title="Link Analysis" icon={<LinkIcon className="w-4 h-4 text-gray-500" />}>
            <DataRow label="Internal Links" value={seo.internalLinks ?? 0} />
            <DataRow label="External Links" value={seo.externalLinks ?? 0} />
            {(seo.internalLinks ?? 0) + (seo.externalLinks ?? 0) > 0 && (
              <DataRow
                label="Link Ratio"
                value={`${(((seo.internalLinks ?? 0) / ((seo.internalLinks ?? 0) + (seo.externalLinks ?? 0))) * 100).toFixed(0)}% internal`}
              />
            )}
          </DataCard>
        </section>
      )}

      {/* Technical Files Checklist */}
      {files && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-500" />
            Technical Files Checklist
          </h2>
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <ChecklistItem
                label="robots.txt"
                status={files.hasRobots ? 'pass' : 'fail'}
                description={files.hasRobots ? 'File found and accessible' : 'File not found'}
              />
              <ChecklistItem
                label="sitemap.xml"
                status={files.hasSitemap ? 'pass' : 'fail'}
                description={files.hasSitemap ? 'Sitemap found and valid' : 'Sitemap not found'}
              />
              <ChecklistItem
                label="Single H1 Tag"
                status={h1Count === 1 ? 'pass' : h1Count === 0 ? 'fail' : 'warning'}
                description={h1Count === 1 ? 'Page has exactly one H1' : `Found ${h1Count} H1 tags`}
              />
              <ChecklistItem
                label="Meta Description"
                status={report.meta?.description ? 'pass' : 'fail'}
                description={report.meta?.description ? 'Meta description present' : 'Missing meta description'}
              />
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

      {/* Taxonomy */}
      {taxonomy && (taxonomy.iabCategory || taxonomy.tags?.length) && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Layers className="w-5 h-5 text-gray-500" />
            Taxonomy
          </h2>
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              {taxonomy.iabCategory && (
                <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                  {taxonomy.iabCategory}
                </span>
              )}
              {taxonomy.iabSubCategory && (
                <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-slate-50 text-slate-600 border border-slate-200">
                  {taxonomy.iabSubCategory}
                </span>
              )}
              {taxonomy.confidence != null && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {Math.round(taxonomy.confidence * 100)}%
                </span>
              )}
              {taxonomy.source && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200">
                  {taxonomy.source}
                </span>
              )}
            </div>
            {taxonomy.tags && taxonomy.tags.length > 0 && (
              <TagList tags={taxonomy.tags} />
            )}
          </div>
        </section>
      )}

      {/* AI Classification */}
      {ai && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Bot className="w-5 h-5 text-gray-500" />
            AI Classification
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DataCard title="Content Analysis" icon={<Bot className="w-4 h-4 text-gray-500" />}>
              {taxonomy?.iabCategory && (
                <DataRow label="Category" value={taxonomy.iabCategory} />
              )}
              {ai.business?.model && (
                <DataRow label="Business Model" value={ai.business.model} />
              )}
              {ai.risk && (
                <DataRow label="Trust Score" value={<ScoreBadge score={ai.risk.score ?? 0} />} />
              )}
              {ai.risk?.sentiment && (
                <DataRow
                  label="Sentiment"
                  value={<StatusBadge status={ai.risk.sentiment === 'Professional'} trueLabel="Professional" falseLabel="Spammy" />}
                />
              )}
            </DataCard>

            {taxonomy?.tags && taxonomy.tags.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">AI-Generated Tags</h3>
                <TagList tags={taxonomy.tags} />
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
