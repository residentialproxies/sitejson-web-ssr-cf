// Backend API response types — matches actual backend /api/v1/ endpoints

export interface BackendErrorPayload {
  code?: string;
  message?: string;
}

export interface SiteReport {
  domain?: string;
  updatedAt?: string;
  freshnessTtlSec?: number;

  visual?: {
    screenshotUrl?: string;
    screenshotPath?: string;
    dominantColor?: string;
    palette?: string[];
    storage?: 'local' | 'r2';
  };

  meta?: {
    title?: string;
    description?: string;
    techStackDetected?: string[];
  };

  seo?: {
    h1Count?: number;
    h2Count?: number;
    internalLinks?: number;
    externalLinks?: number;
    imagesCount?: number;
  };

  files?: {
    hasRobots?: boolean;
    hasSitemap?: boolean;
    robotsSitemapUrls?: string[];
  };

  dns?: {
    provider?: string;
    mxRecords?: string[];
    nsRecords?: string[];
    txtRecords?: string[];
  };

  ads?: {
    isAdvertiser?: boolean;
    advertiserIds?: string[];
    advertiserNames?: string[];
    resultCount?: number;
    transparencySignals?: string[];
  };

  publisher?: {
    hasAdsTxt?: boolean;
    adSystems?: string[];
    directCount?: number;
    resellerCount?: number;
    monetizationSignals?: string[];
  };

  trafficData?: {
    monthlyVisits?: number;
    globalRank?: number | null;
    countryRank?: number | null;
    bounceRate?: number | null;
    avgVisitDuration?: number | null;
    pagesPerVisit?: number | null;
    dataYear?: string | null;
    dataMonth?: string | null;
    cachedAt?: number | null;
    topCountry?: string;
    topRegions?: Array<{ country: string; share: number; countryCode?: number }>;
    topKeywords?: Array<{ keyword: string; volume: number; cpc: number }>;
    trafficSources?: {
      direct: number;
      search: number;
      social: number;
      referral: number;
      mail: number;
      paid: number;
    };
    domainAgeYears?: number | null;
    whois?: {
      registrar?: string | null;
      createdAt?: string | null;
      expiresAt?: string | null;
      updatedAt?: string | null;
      nameservers?: string[];
      status?: string[];
    } | null;
  };

  radar?: {
    globalRank?: number | null;
    rankBucket?: string;
    sourceTimestamp?: string;
    categories?: string[];
    queued?: boolean;
  };

  taxonomy?: {
    iabCategory?: string;
    iabSubCategory?: string;
    confidence?: number;
    tags?: string[];
    source?: string;
  };

  aiAnalysis?: {
    business?: {
      summary?: string;
      model?: string;
      targetAudience?: string;
    };
    risk?: {
      sentiment?: 'Professional' | 'Spammy';
      score?: number;
      isSpam?: boolean;
    };
    visualAnalysis?: {
      designStyle?: string;
      uiScore?: number;
      vibe?: string;
      logoText?: string;
    };
  };

  providerHealth?: Array<{
    provider: string;
    ok: boolean;
    errorCode?: string;
  }>;

  _meta?: {
    timing?: {
      lane_browser_ms?: number;
      lane_fetch_ms?: number;
      lane_ai_ms?: number;
      total_ms?: number;
    };
    html?: {
      source?: string;
      length?: number;
      primary_h1?: string;
    };
    ai?: {
      evaluated?: boolean;
      triggered?: boolean;
      reason?: string;
    };
    debug?: {
      fallback_path?: {
        browser?: string;
        traffic?: string;
      };
    };
  };
}

export interface SiteReportResponse {
  ok: boolean;
  data?: {
    domain: string;
    freshness: {
      is_stale: boolean;
      updated_at: string;
    };
    report: SiteReport;
  };
  error?: BackendErrorPayload;
}

export interface ProviderCompleteness {
  total: number;
  present: number;
  missing: number;
  fields: Record<string, boolean>;
}

export interface ProviderHealthSnapshot {
  ok: boolean;
  errorCode?: string;
}

export interface SiteProviderSummaryItem {
  provider: string;
  hasData: boolean;
  health: ProviderHealthSnapshot | null;
  completeness: ProviderCompleteness;
}

export interface SiteProviderSummaryResponse {
  ok: boolean;
  data?: {
    domain: string;
    updatedAt: string;
    providers: SiteProviderSummaryItem[];
    _meta?: SiteReport['_meta'];
  };
  error?: BackendErrorPayload;
}

export interface AlternativeSite {
  domain: string;
  title?: string;
  rank?: number;
  score?: number;
  reasons?: string[];
}

export interface AlternativesResponse {
  ok: boolean;
  data?: {
    algorithm: string;
    items: AlternativeSite[];
  };
  error?: BackendErrorPayload;
}

export interface DirectoryItem {
  domain: string;
  title: string;
  rank?: number;
}

export interface DirectoryResponse {
  ok: boolean;
  data?: {
    items: DirectoryItem[];
    pagination: {
      page: number;
      page_size: number;
      total: number;
    };
  };
  error?: BackendErrorPayload;
}
