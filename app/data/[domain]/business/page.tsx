import React from 'react';
import type { Metadata } from 'next';
import {
  Briefcase,
  Shield,
  Tag,
  Sparkles,
  Megaphone,
  DollarSign,
  Radio,
  Palette,
} from 'lucide-react';
import { DataCard, DataRow, StatusBadge, ScoreBadge, TagList } from '@/components/domain/data-card';
import { getSiteReport, getSiteReportResult } from '@/lib/api-client/client';
import { evaluateBusinessSubPageIndexability } from '@/lib/seo/indexability';
import { buildDataSubPageMetadata } from '@/lib/seo/metadata';
import { ReportEmptyState } from '../report-empty-state';
import { SectionGuide } from '@/components/domain/SectionGuide';

export const runtime = 'edge';

type BusinessPageProps = {
  params: Promise<{
    domain: string;
  }>;
};

export async function generateMetadata({ params }: BusinessPageProps): Promise<Metadata> {
  const { domain } = await params;
  const result = await getSiteReportResult(domain);

  if (result.status === 'success') {
    const decision = evaluateBusinessSubPageIndexability(result.data.report);
    return buildDataSubPageMetadata(domain, 'business', {
      index: decision.index,
      follow: decision.follow,
    });
  }

  return buildDataSubPageMetadata(domain, 'business', {
    index: false,
    follow: result.status !== 'empty',
  });
}

export default async function BusinessPage({ params }: BusinessPageProps) {
  const { domain } = await params;
  const result = await getSiteReport(domain);
  if (!result) return <ReportEmptyState domain={domain} section="business" />;

  const { report } = result;
  const ai = report.aiAnalysis;
  const ads = report.ads;
  const publisher = report.publisher;
  const taxonomy = report.taxonomy;

  if (!ai) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 text-center">
        <Sparkles className="w-8 h-8 text-gray-300 mx-auto mb-3" />
        <h2 className="text-lg font-medium text-gray-900 mb-1">AI analysis not available</h2>
        <p className="text-sm text-gray-500">
          Business intelligence will appear here once the AI analysis completes.
        </p>
      </div>
    );
  }

  const visualAnalysis = ai?.visualAnalysis;

  return (
    <div className="space-y-6">
      <SectionGuide section="business" />
      {/* Row 1: Business Profile + Trust & Risk */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Business Summary */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-gray-500" />
            Business Intelligence
          </h2>

          {/* Summary Card */}
          {ai.business && (
            <DataCard title="Business Profile" icon={<Briefcase className="w-4 h-4 text-gray-500" />}>
              {ai.business.summary && (
                <div className="pb-2 border-b border-gray-100 mb-2">
                  <p className="text-sm text-gray-700 leading-relaxed">{ai.business.summary}</p>
                </div>
              )}
              {ai.business.model && (
                <DataRow label="Business Model" value={ai.business.model} />
              )}
              {ai.business.targetAudience && (
                <DataRow label="Target Audience" value={ai.business.targetAudience} />
              )}
            </DataCard>
          )}

          {/* Classification */}
          {taxonomy && (
            <DataCard title="Classification" icon={<Tag className="w-4 h-4 text-gray-500" />}>
              <DataRow label="Category" value={taxonomy.iabCategory ?? 'N/A'} />
              <DataRow label="Sub-Category" value={taxonomy.iabSubCategory ?? 'N/A'} />
              {taxonomy.tags && taxonomy.tags.length > 0 && (
                <div className="pt-2 border-t border-gray-100 mt-2">
                  <TagList tags={taxonomy.tags} />
                </div>
              )}
            </DataCard>
          )}
        </div>

        {/* Right: Trust & Risk */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-gray-500" />
            Trust & Risk
          </h2>

          {/* Trust Score */}
          {ai.risk && (
            <DataCard title="Trust Assessment" icon={<Shield className="w-4 h-4 text-gray-500" />}>
              <DataRow
                label="Trust Score"
                value={<ScoreBadge score={ai.risk.score ?? 0} />}
              />
              <DataRow
                label="Sentiment"
                value={
                  <StatusBadge
                    status={ai.risk.sentiment === 'Professional'}
                    trueLabel="Professional"
                    falseLabel="Spammy"
                  />
                }
              />
              <DataRow
                label="Spam Detection"
                value={
                  <StatusBadge
                    status={!ai.risk.isSpam}
                    trueLabel="Clean"
                    falseLabel="Flagged"
                  />
                }
              />
            </DataCard>
          )}

        </div>
      </div>

      {/* Row 2: Google Ads Transparency + Publisher Monetization */}
      {(ads || publisher) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Google Ads Transparency */}
          {ads && (
            <DataCard title="Google Ads Transparency" icon={<Megaphone className="w-4 h-4 text-gray-500" />}>
              <DataRow
                label="Is Advertiser"
                value={
                  <StatusBadge
                    status={!!ads.isAdvertiser}
                    trueLabel="Active Advertiser"
                    falseLabel="Not Advertising"
                  />
                }
              />
              {ads.advertiserNames && ads.advertiserNames.length > 0 && (
                <DataRow
                  label="Advertiser Names"
                  value={
                    <div className="flex flex-col items-end gap-0.5">
                      {ads.advertiserNames.map((name) => (
                        <span key={name} className="text-sm text-gray-900">{name}</span>
                      ))}
                    </div>
                  }
                />
              )}
              {ads.advertiserIds && ads.advertiserIds.length > 0 && (
                <DataRow
                  label="Advertiser IDs"
                  value={
                    <div className="flex flex-col items-end gap-0.5">
                      {ads.advertiserIds.map((id) => (
                        <span key={id} className="font-mono text-xs text-gray-700">{id}</span>
                      ))}
                    </div>
                  }
                />
              )}
              {ads.resultCount != null && (
                <DataRow label="Ad Count" value={ads.resultCount.toLocaleString()} />
              )}
              {ads.transparencySignals && ads.transparencySignals.length > 0 && (
                <div className="pt-2 border-t border-gray-100 mt-2">
                  <div className="flex flex-wrap gap-1.5">
                    {ads.transparencySignals.map((signal) => (
                      <span
                        key={signal}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-emerald-50 text-emerald-700 border border-emerald-200"
                      >
                        {signal}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </DataCard>
          )}

          {/* Right: Publisher Monetization */}
          {publisher && (
            <DataCard title="Publisher Monetization" icon={<DollarSign className="w-4 h-4 text-gray-500" />}>
              <DataRow
                label="ads.txt"
                value={
                  <StatusBadge
                    status={!!publisher.hasAdsTxt}
                    trueLabel="Found"
                    falseLabel="Missing"
                  />
                }
              />
              {publisher.adSystems && publisher.adSystems.length > 0 && (
                <div className="pt-2 border-t border-gray-100 mt-2">
                  <p className="text-xs text-gray-500 mb-1.5">Ad Systems</p>
                  <TagList tags={publisher.adSystems} variant="outline" />
                </div>
              )}
              {publisher.directCount != null && (
                <DataRow label="Direct Sellers" value={publisher.directCount} />
              )}
              {publisher.resellerCount != null && (
                <DataRow label="Reseller Sellers" value={publisher.resellerCount} />
              )}
              {publisher.monetizationSignals && publisher.monetizationSignals.length > 0 && (
                <div className="pt-2 border-t border-gray-100 mt-2">
                  <p className="text-xs text-gray-500 mb-1.5">Monetization Signals</p>
                  <TagList tags={publisher.monetizationSignals} />
                </div>
              )}
            </DataCard>
          )}
        </div>
      )}

      {/* Row 2.5: Visual AI Analysis */}
      {visualAnalysis && (
        <DataCard title="AI Visual Analysis" icon={<Palette className="w-4 h-4 text-gray-500" />}>
          {visualAnalysis.designStyle && (
            <DataRow label="Design Style" value={visualAnalysis.designStyle} />
          )}
          {visualAnalysis.vibe && (
            <DataRow label="Vibe" value={visualAnalysis.vibe} />
          )}
          {visualAnalysis.uiScore != null && (
            <DataRow label="UI Score" value={<ScoreBadge score={visualAnalysis.uiScore} />} />
          )}
          {visualAnalysis.logoText && (
            <DataRow label="Detected Logo Text" value={visualAnalysis.logoText} />
          )}
        </DataCard>
      )}

      {/* Row 3: Taxonomy */}
      {taxonomy && (
        <DataCard title="IAB Taxonomy" icon={<Radio className="w-4 h-4 text-gray-500" />}>
          <DataRow label="IAB Category" value={taxonomy.iabCategory ?? 'N/A'} />
          <DataRow label="IAB Sub-Category" value={taxonomy.iabSubCategory ?? 'N/A'} />
          {taxonomy.confidence != null && (
            <DataRow
              label="Confidence"
              value={
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                    taxonomy.confidence >= 0.8
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : taxonomy.confidence >= 0.6
                        ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                        : 'bg-red-50 text-red-700 border-red-200'
                  }`}
                >
                  {Math.round(taxonomy.confidence * 100)}%
                </span>
              }
            />
          )}
          {taxonomy.tags && taxonomy.tags.length > 0 && (
            <div className="pt-2 border-t border-gray-100 mt-2">
              <TagList tags={taxonomy.tags} />
            </div>
          )}
          {taxonomy.source && (
            <div className="pt-2 mt-1">
              <span className="text-xs text-gray-400">Source: {taxonomy.source}</span>
            </div>
          )}
        </DataCard>
      )}

      {/* Row 5: Business Insights */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Business Insights</h2>
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ai.business?.model && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                <h4 className="text-sm font-medium text-blue-900 mb-1">Business Model</h4>
                <p className="text-xs text-blue-700">{ai.business.model} model detected</p>
              </div>
            )}
            {ai.risk && (
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                <h4 className="text-sm font-medium text-emerald-900 mb-1">Trust Level</h4>
                <p className="text-xs text-emerald-700">
                  {(ai.risk.score ?? 0) >= 70 ? 'High' : (ai.risk.score ?? 0) >= 40 ? 'Medium' : 'Low'} trust with {ai.risk.score}/100 score
                </p>
              </div>
            )}
            {ai.business?.targetAudience && (
              <div className="p-3 bg-teal-50 rounded-lg border border-teal-100">
                <h4 className="text-sm font-medium text-teal-900 mb-1">Audience</h4>
                <p className="text-xs text-teal-700">{ai.business.targetAudience}</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
