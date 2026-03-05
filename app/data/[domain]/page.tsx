import React from 'react';
import {
  Globe,
  Search,
  Server,
  BarChart3,
  FileText,
  Bot,
  Mail,
  Phone,
  Megaphone,
  DollarSign,
  Palette,
  BookOpen,
  Zap,
} from 'lucide-react';
import { DataCard, DataRow, StatusBadge, ScoreBadge, TagList } from '@/components/domain/data-card';
import { getSiteReport } from '@/lib/api-client/client';
import { formatNumber, formatDuration } from '@/lib/utils';
import { normalizeTrafficDataForDisplay } from '@/lib/traffic-display';
import { ReportEmptyState } from './report-empty-state';

export const runtime = 'edge';

type OverviewPageProps = {
  params: Promise<{
    domain: string;
  }>;
};

export default async function OverviewPage({ params }: OverviewPageProps) {
  const { domain } = await params;
  const result = await getSiteReport(domain);
  if (!result) return <ReportEmptyState domain={domain} section="overview" />;

  const { report } = result;
  const seo = report.seo;
  const dns = report.dns;
  const traffic = normalizeTrafficDataForDisplay(report.trafficData);
  const ai = report.aiAnalysis;
  const radar = report.radar;
  const files = report.files;
  const score = report.score;
  const ads = report.ads;
  const publisher = report.publisher;
  const visual = report.visual;
  const taxonomy = report.taxonomy;
  const contacts = seo?.contacts;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* SEO Card */}
      {seo && (
        <DataCard title="SEO Overview" icon={<Search className="w-4 h-4 text-gray-500" />}>
          {score?.value != null && (
            <DataRow label="Site Score" value={<ScoreBadge score={score.value} />} />
          )}
          <DataRow label="H1 Tags" value={seo.h1Count ?? 0} />
          <DataRow label="H2 Tags" value={seo.h2Count ?? 0} />
          <DataRow label="Internal Links" value={seo.internalLinks ?? 0} />
          <DataRow label="External Links" value={seo.externalLinks ?? 0} />
          <DataRow label="Images" value={seo.imagesCount ?? 0} />
        </DataCard>
      )}

      {/* Contacts Card */}
      {contacts && (contacts.emails?.length || contacts.phones?.length || contacts.socialLinks?.length) && (
        <DataCard title="Contacts" icon={<Mail className="w-4 h-4 text-gray-500" />}>
          {contacts.emails && contacts.emails.length > 0 && (
            <div className="py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500 flex items-center gap-1 mb-1">
                <Mail className="w-3 h-3" /> Emails
              </span>
              <div className="flex flex-col gap-1">
                {contacts.emails.map((email) => (
                  <span key={email} className="text-sm text-gray-900 font-mono text-xs">{email}</span>
                ))}
              </div>
            </div>
          )}
          {contacts.phones && contacts.phones.length > 0 && (
            <div className="py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500 flex items-center gap-1 mb-1">
                <Phone className="w-3 h-3" /> Phones
              </span>
              <div className="flex flex-col gap-1">
                {contacts.phones.map((phone) => (
                  <span key={phone} className="text-sm text-gray-900">{phone}</span>
                ))}
              </div>
            </div>
          )}
          {contacts.socialLinks && contacts.socialLinks.length > 0 && (
            <div className="py-2">
              <span className="text-sm text-gray-500 flex items-center gap-1 mb-1">
                <Globe className="w-3 h-3" /> Social Links
              </span>
              <div className="flex flex-col gap-1">
                {contacts.socialLinks.map((link) => (
                  <a
                    key={link}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline truncate block"
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>
          )}
        </DataCard>
      )}

      {/* DNS Card */}
      {dns && (
        <DataCard title="DNS & Infrastructure" icon={<Server className="w-4 h-4 text-gray-500" />}>
          <DataRow label="DNS Provider" value={dns.provider ?? 'Unknown'} />
          {dns.mxRecords && dns.mxRecords.length > 0 && (
            <>
              {dns.mxRecords.map((mx, i) => (
                <DataRow key={mx} label={i === 0 ? 'Mail (MX)' : ''} value={mx} mono />
              ))}
            </>
          )}
          {dns.nsRecords && dns.nsRecords.length > 0 && (
            <DataRow label="NS Records" value={`${dns.nsRecords.length} record${dns.nsRecords.length > 1 ? 's' : ''}`} />
          )}
          {dns.txtRecords && dns.txtRecords.length > 0 && (
            <DataRow label="TXT Records" value={`${dns.txtRecords.length} record${dns.txtRecords.length > 1 ? 's' : ''}`} />
          )}
        </DataCard>
      )}

      {/* Traffic Card */}
      {traffic && (
        <DataCard title="Traffic Stats" icon={<BarChart3 className="w-4 h-4 text-gray-500" />}>
          {traffic.monthlyVisits != null && (
            <DataRow label="Monthly Visits" value={formatNumber(traffic.monthlyVisits)} />
          )}
          {traffic.bounceRate != null && (
            <DataRow label="Bounce Rate" value={`${traffic.bounceRate.toFixed(2)}%`} />
          )}
          {traffic.avgVisitDuration != null && (
            <DataRow label="Avg Visit Duration" value={formatDuration(traffic.avgVisitDuration)} />
          )}
          {traffic.pagesPerVisit != null && (
            <DataRow label="Pages per Visit" value={traffic.pagesPerVisit.toFixed(1)} />
          )}
          {traffic.topCountry && (
            <DataRow label="Top Country" value={traffic.topCountry} />
          )}
          {radar?.globalRank != null && (
            <DataRow label="Global Rank" value={`#${formatNumber(radar.globalRank)}`} />
          )}
          {traffic.countryRank != null && (
            <DataRow label="Country Rank" value={`#${formatNumber(traffic.countryRank)}`} />
          )}
          {traffic.domainAgeYears != null && (
            <DataRow label="Domain Age" value={`${traffic.domainAgeYears.toFixed(1)} years`} />
          )}
        </DataCard>
      )}

      {/* Taxonomy Card */}
      {taxonomy && (
        <DataCard title="Taxonomy" icon={<BookOpen className="w-4 h-4 text-gray-500" />}>
          {taxonomy.iabCategory && (
            <DataRow label="IAB Category" value={taxonomy.iabCategory} />
          )}
          {taxonomy.iabSubCategory && (
            <DataRow label="IAB Sub-Category" value={taxonomy.iabSubCategory} />
          )}
          {taxonomy.confidence != null && (
            <DataRow label="Confidence" value={`${Math.round(taxonomy.confidence * 100)}%`} />
          )}
          {taxonomy.source && (
            <DataRow label="Source" value={taxonomy.source} mono />
          )}
          {taxonomy.tags && taxonomy.tags.length > 0 && (
            <div className="pt-2">
              <TagList tags={taxonomy.tags} />
            </div>
          )}
        </DataCard>
      )}

      {/* Technical Files */}
      {files && (
        <DataCard title="Technical Files" icon={<FileText className="w-4 h-4 text-gray-500" />}>
          <DataRow
            label="robots.txt"
            value={
              <StatusBadge
                status={files.hasRobots ?? false}
                trueLabel="Found"
                falseLabel="Missing"
              />
            }
          />
          <DataRow
            label="sitemap.xml"
            value={
              <StatusBadge
                status={files.hasSitemap ?? false}
                trueLabel="Found"
                falseLabel="Missing"
              />
            }
          />
          {files.robotsSitemapUrls && files.robotsSitemapUrls.length > 0 && (
            <div className="py-2">
              <span className="text-sm text-gray-500 mb-1 block">Sitemap URLs</span>
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
        </DataCard>
      )}

      {/* AI Analysis */}
      {ai && (
        <DataCard title="AI Analysis" icon={<Bot className="w-4 h-4 text-gray-500" />}>
          {ai.business?.summary && (
            <DataRow label="Summary" value={ai.business.summary} />
          )}
          {ai.business?.model && (
            <DataRow label="Business Model" value={ai.business.model} />
          )}
          {ai.risk && (
            <DataRow
              label="Trust Score"
              value={<ScoreBadge score={ai.risk.score ?? 0} />}
            />
          )}
          {ai.risk?.sentiment && (
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
          )}
        </DataCard>
      )}

      {/* Score Signals */}
      {score?.signals && score.signals.length > 0 && (
        <DataCard title="Score Signals" icon={<Zap className="w-4 h-4 text-gray-500" />}>
          {score.value != null && (
            <DataRow label="Overall Score" value={<ScoreBadge score={score.value} />} />
          )}
          <div className="pt-2">
            <TagList tags={score.signals} variant="outline" />
          </div>
        </DataCard>
      )}

      {/* Advertising Card */}
      {ads && (
        <DataCard title="Advertising" icon={<Megaphone className="w-4 h-4 text-gray-500" />}>
          <DataRow
            label="Is Advertiser"
            value={
              <StatusBadge
                status={ads.isAdvertiser ?? false}
                trueLabel="Yes"
                falseLabel="No"
              />
            }
          />
          {ads.advertiserNames && ads.advertiserNames.length > 0 && (
            <DataRow label="Advertiser Names" value={ads.advertiserNames.join(', ')} />
          )}
          {ads.advertiserIds && ads.advertiserIds.length > 0 && (
            <DataRow label="Advertiser IDs" value={ads.advertiserIds.join(', ')} mono />
          )}
          {ads.resultCount != null && (
            <DataRow label="Result Count" value={ads.resultCount} />
          )}
          {ads.transparencySignals && ads.transparencySignals.length > 0 && (
            <div className="pt-2">
              <TagList tags={ads.transparencySignals} />
            </div>
          )}
        </DataCard>
      )}

      {/* Publisher / Monetization Card */}
      {publisher && (
        <DataCard title="Publisher / Monetization" icon={<DollarSign className="w-4 h-4 text-gray-500" />}>
          <DataRow
            label="ads.txt"
            value={
              <StatusBadge
                status={publisher.hasAdsTxt ?? false}
                trueLabel="Found"
                falseLabel="Missing"
              />
            }
          />
          {publisher.adSystems && publisher.adSystems.length > 0 && (
            <div className="py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500 mb-1 block">Ad Systems</span>
              <TagList tags={publisher.adSystems} />
            </div>
          )}
          {publisher.directCount != null && (
            <DataRow label="Direct Sellers" value={publisher.directCount} />
          )}
          {publisher.resellerCount != null && (
            <DataRow label="Reseller Sellers" value={publisher.resellerCount} />
          )}
          {publisher.monetizationSignals && publisher.monetizationSignals.length > 0 && (
            <div className="pt-2">
              <span className="text-sm text-gray-500 mb-1 block">Monetization Signals</span>
              <TagList tags={publisher.monetizationSignals} variant="outline" />
            </div>
          )}
        </DataCard>
      )}

      {/* Visual / Brand Card */}
      {visual && (visual.dominantColor || (visual.palette && visual.palette.length > 0)) && (
        <DataCard title="Visual / Brand" icon={<Palette className="w-4 h-4 text-gray-500" />}>
          {visual.dominantColor && (
            <DataRow
              label="Dominant Color"
              value={
                <span className="flex items-center gap-2">
                  <span
                    className="inline-block w-5 h-5 rounded border border-gray-200"
                    style={{ backgroundColor: visual.dominantColor }}
                  />
                  <span className="font-mono text-xs">{visual.dominantColor}</span>
                </span>
              }
            />
          )}
          {visual.palette && visual.palette.length > 0 && (
            <div className="py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500 mb-1 block">Color Palette</span>
              <div className="flex gap-1.5 mt-1">
                {visual.palette.map((color) => (
                  <span
                    key={color}
                    className="w-7 h-7 rounded border border-gray-200"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}
          {visual.storage && (
            <DataRow label="Storage" value={visual.storage.toUpperCase()} mono />
          )}
        </DataCard>
      )}
    </div>
  );
}
