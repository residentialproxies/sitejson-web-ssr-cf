import type {
  AlternativeSite,
  DirectoryListingData,
  DirectoryStats,
  SiteReport,
} from '@/lib/api-client/types';

export type DataSubPage = 'traffic' | 'seo' | 'tech' | 'business' | 'alternatives';

export type SeoIndexabilityDecision = {
  index: boolean;
  follow: boolean;
  reason: string;
  signals: string[];
};

export const MAX_INDEXABLE_DIRECTORY_PAGE = 6;
export const MAX_SITEMAP_DIRECTORY_PAGE = 6;

const indexDecision = (reason: string, signals: string[]): SeoIndexabilityDecision => ({
  index: true,
  follow: true,
  reason,
  signals,
});

const noindexDecision = (
  reason: string,
  signals: string[] = [],
  follow = true,
): SeoIndexabilityDecision => ({
  index: false,
  follow,
  reason,
  signals,
});

const hasText = (value?: string | null) => typeof value === 'string' && value.trim().length > 0;
const hasNumber = (value?: number | null) => typeof value === 'number' && Number.isFinite(value);
const hasPositiveNumber = (value?: number | null) => hasNumber(value) && (value ?? 0) > 0;
const countTrue = (values: boolean[]) => values.filter(Boolean).length;

export const getRenderableDirectoryItemCount = (listing?: DirectoryListingData | null): number =>
  listing?.items.filter((item) => hasText(item.domain)).length ?? 0;

export const getDirectoryClusterSignals = (
  listing?: DirectoryListingData | null,
  stats?: DirectoryStats | null,
): string[] => {
  const signals: string[] = [];
  const describedItems = listing?.items.filter((item) => hasText(item.title) && hasText(item.description)).length ?? 0;

  if ((stats?.hasTrafficData ?? 0) >= 3) signals.push('traffic_coverage');
  if (hasNumber(stats?.avgLegitimacyScore)) signals.push('legitimacy_score');
  if ((stats?.topTechnologies?.length ?? 0) > 0) signals.push('top_technologies');
  if ((stats?.topTags?.length ?? 0) > 0) signals.push('top_tags');
  if ((stats?.topCountries?.length ?? 0) > 0) signals.push('top_countries');
  if (describedItems >= 3) signals.push('described_items');

  return signals;
};

export const evaluateDirectoryIndexability = (
  listing?: DirectoryListingData | null,
  stats?: DirectoryStats | null,
): SeoIndexabilityDecision => {
  const total = listing?.total ?? stats?.total ?? 0;
  const renderableItems = getRenderableDirectoryItemCount(listing);
  const clusterSignals = getDirectoryClusterSignals(listing, stats);

  if (total < 8) {
    return noindexDecision('directory_total_below_threshold', clusterSignals);
  }

  if (renderableItems < 3) {
    return noindexDecision('directory_first_page_below_threshold', clusterSignals);
  }

  if (clusterSignals.length < 1) {
    return noindexDecision('directory_missing_cluster_signals');
  }

  return indexDecision('directory_indexable', clusterSignals);
};

export const evaluatePaginatedDirectoryIndexability = ({
  pageNum,
  listing,
  baseDecision,
}: {
  pageNum: number;
  listing?: DirectoryListingData | null;
  baseDecision: SeoIndexabilityDecision;
}): SeoIndexabilityDecision => {
  const renderableItems = getRenderableDirectoryItemCount(listing);
  const totalPages = listing?.totalPages ?? 0;
  const signals = baseDecision.signals;

  if (!baseDecision.index) {
    return noindexDecision('directory_base_not_indexable', signals);
  }

  if (!Number.isInteger(pageNum) || pageNum < 2) {
    return noindexDecision('directory_page_invalid', signals, false);
  }

  if (totalPages > 0 && pageNum > totalPages) {
    return noindexDecision('directory_page_out_of_range', signals, false);
  }

  if (pageNum > MAX_INDEXABLE_DIRECTORY_PAGE) {
    return noindexDecision('directory_page_above_index_cap', signals);
  }

  if (renderableItems < 6) {
    return noindexDecision('directory_page_below_item_threshold', signals);
  }

  return indexDecision('directory_page_indexable', signals);
};

const hasTrafficEvidence = (report?: SiteReport | null): boolean => {
  if (!report) return false;

  return countTrue([
    hasPositiveNumber(report.trafficData?.monthlyVisits),
    hasPositiveNumber(report.trafficData?.globalRank),
    hasPositiveNumber(report.radar?.globalRank),
    hasNumber(report.trafficData?.bounceRate),
    hasNumber(report.trafficData?.avgVisitDuration),
    hasNumber(report.trafficData?.pagesPerVisit),
    hasText(report.trafficData?.topCountry),
  ]) > 0;
};

const hasSeoEvidence = (report?: SiteReport | null): boolean => {
  if (!report) return false;

  return countTrue([
    hasText(report.meta?.title),
    hasText(report.meta?.description),
    hasPositiveNumber(report.seo?.h1Count),
    hasPositiveNumber(report.seo?.h2Count),
    hasPositiveNumber(report.seo?.internalLinks),
    hasPositiveNumber(report.seo?.externalLinks),
    Boolean(report.files?.hasRobots),
    Boolean(report.files?.hasSitemap),
    (report.files?.robotsSitemapUrls?.length ?? 0) > 0,
  ]) > 0;
};

const hasTechEvidence = (report?: SiteReport | null): boolean => {
  if (!report) return false;

  return countTrue([
    (report.meta?.techStackDetected?.length ?? 0) > 0,
    hasText(report.dns?.provider),
    (report.dns?.mxRecords?.length ?? 0) > 0,
    (report.dns?.nsRecords?.length ?? 0) > 0,
    (report.dns?.txtRecords?.length ?? 0) > 0,
  ]) > 0;
};

const hasBusinessEvidence = (report?: SiteReport | null): boolean => {
  if (!report) return false;

  return countTrue([
    hasText(report.aiAnalysis?.business?.summary),
    hasText(report.aiAnalysis?.business?.model),
    hasText(report.aiAnalysis?.business?.targetAudience),
    hasNumber(report.aiAnalysis?.risk?.score),
    Boolean(report.ads?.isAdvertiser),
    (report.ads?.advertiserNames?.length ?? 0) > 0,
    (report.ads?.transparencySignals?.length ?? 0) > 0,
    Boolean(report.publisher?.hasAdsTxt),
    (report.publisher?.adSystems?.length ?? 0) > 0,
    hasText(report.taxonomy?.iabCategory),
    (report.taxonomy?.tags?.length ?? 0) > 0,
  ]) > 0;
};

export const getReportModuleSignals = (report?: SiteReport | null): string[] => {
  if (!report) return [];

  const signals: string[] = [];

  if (hasText(report.meta?.title) || hasText(report.meta?.description)) signals.push('meta');
  if (hasTrafficEvidence(report)) signals.push('traffic');
  if (hasSeoEvidence(report)) signals.push('seo');
  if (hasTechEvidence(report)) signals.push('tech');
  if (hasBusinessEvidence(report)) signals.push('business');
  if (hasText(report.taxonomy?.iabCategory) || (report.taxonomy?.tags?.length ?? 0) > 0) signals.push('taxonomy');
  if (hasText(report.visual?.screenshotUrl)) signals.push('visual');

  return signals;
};

export const evaluateReportIndexability = (report?: SiteReport | null): SeoIndexabilityDecision => {
  const signals = getReportModuleSignals(report);

  if (!report) {
    return noindexDecision('report_missing', [], false);
  }

  if (report.aiAnalysis?.risk?.isSpam) {
    return noindexDecision('report_flagged_as_spam', signals);
  }

  if (signals.length < 3) {
    return noindexDecision('report_module_count_below_threshold', signals);
  }

  return indexDecision('report_indexable', signals);
};

export const evaluateTrafficSubPageIndexability = (report?: SiteReport | null): SeoIndexabilityDecision => {
  if (!report) {
    return noindexDecision('traffic_report_missing', [], false);
  }

  const strongSignals = countTrue([
    hasPositiveNumber(report.trafficData?.monthlyVisits),
    hasPositiveNumber(report.trafficData?.globalRank),
    hasPositiveNumber(report.radar?.globalRank),
  ]);

  const moderateSignals = countTrue([
    hasNumber(report.trafficData?.bounceRate),
    hasNumber(report.trafficData?.avgVisitDuration),
    hasNumber(report.trafficData?.pagesPerVisit),
    hasText(report.trafficData?.topCountry),
    hasNumber(report.trafficData?.domainAgeYears),
    (report.trafficData?.topRegions?.length ?? 0) > 0,
    (report.trafficData?.topKeywords?.length ?? 0) > 0,
  ]);

  const signals = [
    ...(strongSignals > 0 ? ['traffic_strong_signal'] : []),
    ...(moderateSignals > 0 ? ['traffic_moderate_signals'] : []),
  ];

  if (strongSignals >= 1 || moderateSignals >= 2) {
    return indexDecision('traffic_indexable', signals);
  }

  return noindexDecision('traffic_signals_below_threshold', signals);
};

export const evaluateSeoSubPageIndexability = (report?: SiteReport | null): SeoIndexabilityDecision => {
  if (!report) {
    return noindexDecision('seo_report_missing', [], false);
  }

  const evidenceGroups = countTrue([
    hasText(report.meta?.title) || hasText(report.meta?.description),
    hasPositiveNumber(report.seo?.h1Count) || hasPositiveNumber(report.seo?.h2Count),
    hasPositiveNumber(report.seo?.internalLinks) || hasPositiveNumber(report.seo?.externalLinks),
    Boolean(report.files?.hasRobots) || Boolean(report.files?.hasSitemap) || (report.files?.robotsSitemapUrls?.length ?? 0) > 0,
  ]);

  const signals = [
    ...(hasText(report.meta?.title) || hasText(report.meta?.description) ? ['meta_fields'] : []),
    ...(hasPositiveNumber(report.seo?.h1Count) || hasPositiveNumber(report.seo?.h2Count) ? ['heading_structure'] : []),
    ...(hasPositiveNumber(report.seo?.internalLinks) || hasPositiveNumber(report.seo?.externalLinks) ? ['link_graph'] : []),
    ...(Boolean(report.files?.hasRobots) || Boolean(report.files?.hasSitemap) || (report.files?.robotsSitemapUrls?.length ?? 0) > 0 ? ['technical_files'] : []),
  ];

  if (evidenceGroups >= 2) {
    return indexDecision('seo_indexable', signals);
  }

  return noindexDecision('seo_signals_below_threshold', signals);
};

export const evaluateTechSubPageIndexability = (report?: SiteReport | null): SeoIndexabilityDecision => {
  if (!report) {
    return noindexDecision('tech_report_missing', [], false);
  }

  const techCount = report.meta?.techStackDetected?.filter((item) => hasText(item)).length ?? 0;
  const infraSignals = countTrue([
    hasText(report.dns?.provider),
    (report.dns?.mxRecords?.length ?? 0) > 0,
    (report.dns?.nsRecords?.length ?? 0) > 0,
    (report.dns?.txtRecords?.length ?? 0) > 0,
  ]);

  const signals = [
    ...(techCount > 0 ? ['tech_stack_detected'] : []),
    ...(infraSignals > 0 ? ['infrastructure_signals'] : []),
  ];

  if (techCount >= 1 || infraSignals >= 2) {
    return indexDecision('tech_indexable', signals);
  }

  return noindexDecision('tech_signals_below_threshold', signals);
};

export const evaluateBusinessSubPageIndexability = (report?: SiteReport | null): SeoIndexabilityDecision => {
  if (!report) {
    return noindexDecision('business_report_missing', [], false);
  }

  if (hasText(report.aiAnalysis?.business?.summary)) {
    return indexDecision('business_summary_present', ['business_summary']);
  }

  const signalCount = countTrue([
    hasText(report.aiAnalysis?.business?.model),
    hasText(report.aiAnalysis?.business?.targetAudience),
    hasNumber(report.aiAnalysis?.risk?.score),
    Boolean(report.ads?.isAdvertiser) || (report.ads?.advertiserNames?.length ?? 0) > 0 || (report.ads?.transparencySignals?.length ?? 0) > 0,
    Boolean(report.publisher?.hasAdsTxt) || (report.publisher?.adSystems?.length ?? 0) > 0 || hasPositiveNumber(report.publisher?.directCount) || hasPositiveNumber(report.publisher?.resellerCount),
    hasText(report.taxonomy?.iabCategory) || (report.taxonomy?.tags?.length ?? 0) > 0,
  ]);

  const signals = [
    ...(hasNumber(report.aiAnalysis?.risk?.score) ? ['trust_score'] : []),
    ...(Boolean(report.ads?.isAdvertiser) || (report.ads?.advertiserNames?.length ?? 0) > 0 || (report.ads?.transparencySignals?.length ?? 0) > 0 ? ['ads_signals'] : []),
    ...(Boolean(report.publisher?.hasAdsTxt) || (report.publisher?.adSystems?.length ?? 0) > 0 ? ['publisher_signals'] : []),
    ...(hasText(report.taxonomy?.iabCategory) || (report.taxonomy?.tags?.length ?? 0) > 0 ? ['taxonomy'] : []),
  ];

  if (signalCount >= 2) {
    return indexDecision('business_indexable', signals);
  }

  return noindexDecision('business_signals_below_threshold', signals);
};

export const evaluateAlternativesIndexability = (
  items?: AlternativeSite[] | null,
): SeoIndexabilityDecision => {
  const meaningfulCount = items?.filter((item) => hasText(item.domain)).length ?? 0;
  const signals = meaningfulCount > 0 ? ['alternatives_present'] : [];

  if (meaningfulCount >= 3) {
    return indexDecision('alternatives_indexable', signals);
  }

  return noindexDecision('alternatives_below_threshold', signals);
};

export const evaluateDataSubPageIndexability = (
  report: SiteReport | null | undefined,
  subPage: Exclude<DataSubPage, 'alternatives'>,
): SeoIndexabilityDecision => {
  switch (subPage) {
    case 'traffic':
      return evaluateTrafficSubPageIndexability(report);
    case 'seo':
      return evaluateSeoSubPageIndexability(report);
    case 'tech':
      return evaluateTechSubPageIndexability(report);
    case 'business':
      return evaluateBusinessSubPageIndexability(report);
  }
};
