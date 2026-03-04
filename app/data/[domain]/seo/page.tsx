import React from 'react';
import type { Metadata } from 'next';
import {
  Search,
  FileText,
  Bot,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Link as LinkIcon,
  Heading1,
  Mail,
  Phone,
  Globe,
  Sparkles,
  Layers,
} from 'lucide-react';
import { DataCard, DataRow, StatusBadge, ScoreBadge, TagList } from '@/components/domain/data-card';
import { getSiteReport } from '@/lib/api-client/client';
import { cn } from '@/lib/utils';
import { buildDataSubPageMetadata } from '@/lib/seo/metadata';
import { ReportEmptyState } from '../report-empty-state';

export const runtime = 'edge';

type SeoPageProps = {
  params: Promise<{
    domain: string;
  }>;
};

export async function generateMetadata({ params }: SeoPageProps): Promise<Metadata> {
  const { domain } = await params;
  return buildDataSubPageMetadata(domain, 'seo');
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

function formatSignal(signal: string): string {
  return signal.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function isPositiveSignal(signal: string): boolean {
  return signal.startsWith('has_') || signal === 'ai_professional';
}

function getDomainFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export default async function SeoPage({ params }: SeoPageProps) {
  const { domain } = await params;
  const result = await getSiteReport(domain);
  if (!result) return <ReportEmptyState domain={domain} section="SEO" />;

  const { report } = result;
  const seo = report.seo;
  const files = report.files;
  const score = report.score;
  const ai = report.aiAnalysis;
  const contacts = seo?.contacts;
  const taxonomy = report.taxonomy;
  const h1Count = seo?.h1Count ?? 0;

  return (
    <div className="space-y-6">
      {/* Score Overview */}
      {score?.value != null && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Search className="w-5 h-5 text-gray-500" />
            Site Score
          </h2>
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-6">
              <div className="flex-shrink-0">
                <div
                  className={cn(
                    'w-24 h-24 rounded-full border-4 flex items-center justify-center',
                    score.value >= 70
                      ? 'border-emerald-500 bg-emerald-50'
                      : score.value >= 40
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-red-500 bg-red-50',
                  )}
                >
                  <span
                    className={cn(
                      'text-3xl font-bold',
                      score.value >= 70
                        ? 'text-emerald-600'
                        : score.value >= 40
                          ? 'text-amber-600'
                          : 'text-red-600',
                    )}
                  >
                    {score.value}
                  </span>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  {score.value >= 70 ? 'Good' : score.value >= 40 ? 'Needs Improvement' : 'Poor'} SEO Health
                </h3>
                <p className="text-sm text-gray-500">
                  Based on heading structure, link distribution, and technical files analysis.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Score Signals */}
      {score?.signals && score.signals.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-gray-500" />
            Score Signals
          </h2>
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
            <div className="flex flex-wrap gap-1.5">
              {score.signals.map((signal) => (
                <span
                  key={signal}
                  className={cn(
                    'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border',
                    isPositiveSignal(signal)
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200',
                  )}
                >
                  {formatSignal(signal)}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

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

      {/* Contact Information */}
      {contacts && (contacts.emails?.length || contacts.phones?.length || contacts.socialLinks?.length) && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Mail className="w-5 h-5 text-gray-500" />
            Contact Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contacts.emails && contacts.emails.length > 0 && (
              <DataCard title="Email Addresses" icon={<Mail className="w-4 h-4 text-gray-500" />}>
                {contacts.emails.map((email) => (
                  <div key={email} className="py-2 border-b border-gray-100 last:border-0">
                    <a
                      href={`mailto:${email}`}
                      className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {email}
                    </a>
                  </div>
                ))}
              </DataCard>
            )}

            {contacts.phones && contacts.phones.length > 0 && (
              <DataCard title="Phone Numbers" icon={<Phone className="w-4 h-4 text-gray-500" />}>
                {contacts.phones.map((phone) => (
                  <div key={phone} className="py-2 border-b border-gray-100 last:border-0">
                    <a
                      href={`tel:${phone}`}
                      className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {phone}
                    </a>
                  </div>
                ))}
              </DataCard>
            )}

            {contacts.socialLinks && contacts.socialLinks.length > 0 && (
              <DataCard title="Social Links" icon={<Globe className="w-4 h-4 text-gray-500" />}>
                {contacts.socialLinks.map((url) => (
                  <div key={url} className="py-2 border-b border-gray-100 last:border-0">
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {getDomainFromUrl(url)}
                    </a>
                  </div>
                ))}
              </DataCard>
            )}
          </div>
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
                <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                  {taxonomy.iabCategory}
                </span>
              )}
              {taxonomy.iabSubCategory && (
                <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-purple-50 text-purple-600 border border-purple-200">
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
