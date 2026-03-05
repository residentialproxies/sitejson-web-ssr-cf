import type {
  SiteReportResponse,
  DirectoryResponse,
  SiteReport,
  SiteProviderSummaryResponse,
} from './types';
import { readRuntimeEnv } from '@/lib/runtime-env';

const getBaseUrl = () =>
  readRuntimeEnv('SITEJSON_API_BASE_URL') ??
  readRuntimeEnv('NEXT_PUBLIC_SITEJSON_API_BASE_URL') ??
  'http://127.0.0.1:8787';

const getApiKey = () => readRuntimeEnv('SITEJSON_API_KEY') ?? '';

const fetchApi = async <T>(path: string): Promise<T | null> => {
  const apiKey = getApiKey();
  const headers: Record<string, string> = { accept: 'application/json' };
  if (apiKey) headers['x-api-key'] = apiKey;

  try {
    const res = await fetch(`${getBaseUrl()}${path}`, {
      headers,
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
};

export const getSiteReport = async (
  domain: string,
): Promise<{ report: SiteReport; isStale: boolean; updatedAt: string } | null> => {
  const res = await fetchApi<SiteReportResponse>(
    `/api/v1/sites/${encodeURIComponent(domain)}`,
  );
  if (!res?.ok || !res.data) return null;
  return {
    report: res.data.report,
    isStale: res.data.freshness?.is_stale ?? true,
    updatedAt: res.data.freshness?.updated_at ?? '',
  };
};

export const getDirectory = async (
  type: string,
  slug: string,
  page = 1,
  pageSize = 24,
): Promise<DirectoryResponse['data'] | null> => {
  const res = await fetchApi<DirectoryResponse>(
    `/api/v1/directory/${encodeURIComponent(type)}/${encodeURIComponent(slug)}?page=${page}&page_size=${pageSize}`,
  );
  if (!res?.ok || !res.data) return null;
  return res.data;
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

// Note: SWR hooks are available in './swr-hooks' but must be imported separately
// to avoid bundling client-only code in server components
