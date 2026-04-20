import type {
  AlternativesResponse,
  DirectoryListingResult,
  DirectoryResponse,
  DirectoryStats,
  DirectoryStatsResponse,
  DirectoryTypeSummary,
  DirectoryTypeSummaryResponse,
  GlobalInsights,
  GlobalInsightsResponse,
  PublicDataResult,
  SiteReport,
  SiteProviderSummaryResponse,
  SiteReportResponse,
} from './types';
import {
  DEFAULT_DIRECTORY_PAGE_SIZE,
  createDirectoryListingErrorResult,
  createDirectoryListingResult,
} from './directory-results';
import { headers } from 'next/headers';
import { readRuntimeEnv } from '@/lib/runtime-env';
import { resolveStoredScreenshotUrl } from '@/lib/screenshot-url';

const getApiKey = () => readRuntimeEnv('SITEJSON_API_KEY') ?? '';

const DEFAULT_PUBLIC_SITE_BASE_URL = 'http://127.0.0.1:3000';

const normalizeBaseUrl = (value: string | undefined) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed.replace(/\/+$/, '') : undefined;
};

const pickForwardedHeader = (value: string | null) => value?.split(',')[0]?.trim() || undefined;

const getRequestSiteBaseUrl = async (): Promise<string | undefined> => {
  try {
    const requestHeaders = await headers();
    const host =
      pickForwardedHeader(requestHeaders.get('x-forwarded-host'))
      ?? pickForwardedHeader(requestHeaders.get('host'));

    if (!host) {
      return undefined;
    }

    const protocol =
      pickForwardedHeader(requestHeaders.get('x-forwarded-proto'))
      ?? (host.startsWith('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'https');

    return normalizeBaseUrl(`${protocol}://${host}`);
  } catch {
    return undefined;
  }
};

const getPublicSiteBaseUrl = async () =>
  normalizeBaseUrl(readRuntimeEnv('PUBLIC_SITE_BASE_URL'))
  ?? await getRequestSiteBaseUrl()
  ?? DEFAULT_PUBLIC_SITE_BASE_URL;

const getBackendBaseUrl = () =>
  readRuntimeEnv('SITEJSON_API_BASE_URL') ??
  readRuntimeEnv('NEXT_PUBLIC_SITEJSON_API_BASE_URL') ??
  'http://127.0.0.1:8787';

const getBaseUrl = () => {
  const apiKey = getApiKey();
  if (!apiKey) {
    return null;
  }

  return getBackendBaseUrl();
};

const buildRequestUrl = async (path: string): Promise<string> => {
  if (!getApiKey()) {
    return `${await getPublicSiteBaseUrl()}/api/sitejson${path.replace(/^\/api\/v1/, '')}`;
  }

  return `${getBaseUrl()}${path}`;
};

const buildProxyRequestUrl = async (path: string): Promise<string> =>
  `${await getPublicSiteBaseUrl()}/api/sitejson${path.replace(/^\/api\/v1/, '')}`;

const PUBLIC_READ_REVALIDATE_SECONDS = 300;
const REQUEST_TIMEOUT_MS = 10000;

type FetchApiFailureReason = 'unavailable' | 'timeout';

type FetchApiResult<T> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
      reason: FetchApiFailureReason;
      statusCode?: number;
      message: string;
    };

type FetchApiOptions = {
  revalidateSeconds?: number;
  timeoutMs?: number;
};

const shouldRetryUpstreamStatus = (statusCode?: number) =>
  statusCode === 502 || statusCode === 503 || statusCode === 504;

const fetchApiResult = async <T>(
  path: string,
  options?: FetchApiOptions,
): Promise<FetchApiResult<T>> => {
  const apiKey = getApiKey();
  const headers: Record<string, string> = { accept: 'application/json' };
  if (apiKey) headers['x-api-key'] = apiKey;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options?.timeoutMs ?? REQUEST_TIMEOUT_MS);
  const requestInit: RequestInit & { next?: { revalidate: number } } = {
    headers,
    signal: controller.signal,
    ...(options?.revalidateSeconds ? {} : { cache: 'no-store' as RequestCache }),
  };

  if (options?.revalidateSeconds) {
    requestInit.next = { revalidate: options.revalidateSeconds };
  }

  try {
    let res = await fetch(await buildRequestUrl(path), requestInit);
    if (!res.ok && (res.status === 401 || res.status === 403) && getApiKey()) {
      const proxyHeaders = new Headers(headers);
      proxyHeaders.delete('x-api-key');
      res = await fetch(await buildProxyRequestUrl(path), {
        ...requestInit,
        headers: proxyHeaders,
      });
    }

    if (!res.ok) {
      return {
        ok: false,
        reason: 'unavailable',
        statusCode: res.status,
        message: `Upstream request failed with status ${res.status}.`,
      };
    }

    return {
      ok: true,
      data: (await res.json()) as T,
    };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        ok: false,
        reason: 'timeout',
        message: 'Directory request timed out.',
      };
    }

    return {
      ok: false,
      reason: 'unavailable',
      message: error instanceof Error ? error.message : 'Failed to reach SiteJSON backend.',
    };
  } finally {
    clearTimeout(timeout);
  }
};

const fetchApi = async <T>(path: string, options?: FetchApiOptions): Promise<T | null> => {
  const result = await fetchApiResult<T>(path, options);
  return result.ok ? result.data : null;
};

const mapFailureReason = (
  failure: Extract<FetchApiResult<unknown>, { ok: false }>,
): 'unavailable' | 'timeout' => failure.reason;

const toPublicDataResult = <T>(
  payload: T | null | undefined,
  failure?: Extract<FetchApiResult<unknown>, { ok: false }>,
): PublicDataResult<T> => {
  if (failure) {
    return {
      status: mapFailureReason(failure),
      data: null,
      message: failure.message,
    };
  }

  if (payload == null) {
    return {
      status: 'empty',
      data: null,
    };
  }

  return {
    status: 'success',
    data: payload,
  };
};

export const getSiteReport = async (
  domain: string,
): Promise<{ report: SiteReport; isStale: boolean; updatedAt: string } | null> => {
  const result = await getSiteReportResult(domain);
  return result.status === 'success' ? result.data : null;
};

export const getSiteReportResult = async (
  domain: string,
): Promise<PublicDataResult<{ report: SiteReport; isStale: boolean; updatedAt: string }>> => {
  const reportPath = `/api/v1/sites/${encodeURIComponent(domain)}`;
  // Public report pages should reuse a short-lived cached snapshot so transient upstream
  // timeouts do not replace live reports with the temporary-unavailable shell.
  const requestOptions: FetchApiOptions = {
    revalidateSeconds: PUBLIC_READ_REVALIDATE_SECONDS,
    timeoutMs: 15000,
  };

  let response = await fetchApiResult<SiteReportResponse>(reportPath, requestOptions);
  if (!response.ok && (response.reason === 'timeout' || shouldRetryUpstreamStatus(response.statusCode))) {
    response = await fetchApiResult<SiteReportResponse>(reportPath, requestOptions);
  }

  if (!response.ok) {
    if (response.statusCode === 404) {
      return { status: 'empty', data: null };
    }

    return {
      status: response.reason,
      data: null,
      message: response.message,
    };
  }

  if (!response.data.ok) {
    return {
      status: 'unavailable',
      data: null,
      message: response.data.error?.message ?? 'Site report is temporarily unavailable.',
    };
  }

  if (!response.data.data) {
    return { status: 'empty', data: null };
  }

  const report = response.data.data.report;
  const normalizedReport = report.visual
    ? {
        ...report,
        visual: {
          ...report.visual,
          screenshotUrl: resolveStoredScreenshotUrl(report.domain ?? domain, report.visual?.screenshotUrl),
        },
      }
    : report;

  return {
    status: 'success',
    data: {
      report: normalizedReport,
      isStale: response.data.data.freshness?.is_stale ?? true,
      updatedAt: response.data.data.freshness?.updated_at ?? '',
    },
  };
};

export const getDirectoryListingResult = async (
  type: string,
  slug: string,
  page = 1,
  pageSize = DEFAULT_DIRECTORY_PAGE_SIZE,
  options?: { sort?: string; minScore?: number; hasTraffic?: boolean },
): Promise<DirectoryListingResult> => {
  let qs = `page=${page}&page_size=${pageSize}`;
  if (options?.sort) qs += `&sort=${encodeURIComponent(options.sort)}`;
  if (options?.minScore !== undefined) qs += `&min_score=${options.minScore}`;
  if (options?.hasTraffic) qs += `&has_traffic=true`;

  const response = await fetchApiResult<DirectoryResponse>(
    `/api/v1/directory/${encodeURIComponent(type)}/${encodeURIComponent(slug)}?${qs}`,
    { revalidateSeconds: PUBLIC_READ_REVALIDATE_SECONDS },
  );

  if (!response.ok) {
    return createDirectoryListingErrorResult(
      mapFailureReason(response),
      response.message,
      page,
      pageSize,
    );
  }

  if (!response.data.ok) {
    return createDirectoryListingErrorResult(
      'unavailable',
      response.data.error?.message ?? 'Directory data is temporarily unavailable.',
      page,
      pageSize,
    );
  }

  const normalizedItems = response.data.data?.items?.map((item) => ({
    ...item,
    screenshotUrl: resolveStoredScreenshotUrl(item.domain, item.screenshotUrl),
  }));

  return createDirectoryListingResult(
    response.data.data
      ? {
          ...response.data.data,
          ...(normalizedItems ? { items: normalizedItems } : {}),
        }
      : response.data.data,
    page,
    pageSize,
  );
};

export const getDirectory = async (
  type: string,
  slug: string,
  page = 1,
  pageSize = DEFAULT_DIRECTORY_PAGE_SIZE,
  options?: { sort?: string; minScore?: number; hasTraffic?: boolean },
): Promise<DirectoryResponse['data'] | null> => {
  const result = await getDirectoryListingResult(type, slug, page, pageSize, options);
  if (result.status === 'unavailable' || result.status === 'timeout' || !result.data) {
    return null;
  }

  return {
    items: result.data.items,
    pagination: {
      page: result.data.page,
      page_size: result.data.pageSize,
      total: result.data.total,
    },
  };
};

export const getDirectoryStatsResult = async (
  type: string,
  slug: string,
): Promise<PublicDataResult<DirectoryStats>> => {
  const response = await fetchApiResult<DirectoryStatsResponse>(
    `/api/v1/directory/${encodeURIComponent(type)}/${encodeURIComponent(slug)}/stats`,
    { revalidateSeconds: PUBLIC_READ_REVALIDATE_SECONDS },
  );

  if (!response.ok) {
    return toPublicDataResult<DirectoryStats>(null, response);
  }

  if (!response.data.ok) {
    return {
      status: 'unavailable',
      data: null,
      message: response.data.error?.message ?? 'Directory stats are temporarily unavailable.',
    };
  }

  return toPublicDataResult(response.data.data);
};

export const getDirectoryStats = async (
  type: string,
  slug: string,
): Promise<DirectoryStats | null> => {
  const result = await getDirectoryStatsResult(type, slug);
  return result.status === 'success' ? result.data : null;
};

export const getDirectoryTypeSummaryResult = async (
  type: string,
  limit = 50,
): Promise<PublicDataResult<DirectoryTypeSummary>> => {
  const response = await fetchApiResult<DirectoryTypeSummaryResponse>(
    `/api/v1/directory/${encodeURIComponent(type)}?limit=${limit}`,
    { revalidateSeconds: PUBLIC_READ_REVALIDATE_SECONDS },
  );

  if (!response.ok) {
    return toPublicDataResult<DirectoryTypeSummary>(null, response);
  }

  if (!response.data.ok) {
    return {
      status: 'unavailable',
      data: null,
      message: response.data.error?.message ?? 'Directory summary is temporarily unavailable.',
    };
  }

  return toPublicDataResult(response.data.data);
};

export const getDirectoryTypeSummary = async (
  type: string,
  limit = 50,
): Promise<DirectoryTypeSummary | null> => {
  const result = await getDirectoryTypeSummaryResult(type, limit);
  return result.status === 'success' ? result.data : null;
};

export const getGlobalInsightsResult = async (): Promise<PublicDataResult<GlobalInsights>> => {
  const response = await fetchApiResult<GlobalInsightsResponse>('/api/v1/insights', {
    revalidateSeconds: PUBLIC_READ_REVALIDATE_SECONDS,
  });

  if (!response.ok) {
    return toPublicDataResult<GlobalInsights>(null, response);
  }

  if (!response.data.ok) {
    return {
      status: 'unavailable',
      data: null,
      message: response.data.error?.message ?? 'Global insights are temporarily unavailable.',
    };
  }

  return toPublicDataResult(response.data.data);
};

export const getGlobalInsights = async (): Promise<GlobalInsights | null> => {
  const result = await getGlobalInsightsResult();
  return result.status === 'success' ? result.data : null;
};

export const getSiteProviderSummary = async (
  domain: string,
): Promise<SiteProviderSummaryResponse['data'] | null> => {
  const res = await fetchApi<SiteProviderSummaryResponse>(
    `/api/v1/sites/${encodeURIComponent(domain)}/providers`,
  );
  if (!res?.ok || !res.data) return null;
  return res.data;
};

export const getSiteAlternatives = async (
  domain: string,
): Promise<AlternativesResponse['data'] | null> => {
  const res = await fetchApi<AlternativesResponse>(
    `/api/v1/sites/${encodeURIComponent(domain)}/alternatives`,
  );
  if (!res?.ok || !res.data) return null;
  return res.data;
};

// Note: SWR hooks are available in './swr-hooks' but must be imported separately
// to avoid bundling client-only code in server components
