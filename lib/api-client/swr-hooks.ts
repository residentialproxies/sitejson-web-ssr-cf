'use client';

import useSWR from 'swr';
import type { DirectoryResponse, SiteReport } from './types';

// SWR fetcher for client-side data fetching
const swrFetcher = async <T>(url: string): Promise<T> => {
  const res = await fetch(url, {
    headers: { accept: 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }
  return res.json() as Promise<T>;
};

// SWR hook for site report with stale-while-revalidate
export function useSiteReport(domain: string | null) {
  const swr = useSWR<
    { report: SiteReport; isStale: boolean; updatedAt: string } | null
  >(
    domain ? `/api/sitejson/sites/${encodeURIComponent(domain)}` : null,
    swrFetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 2000,
      suspense: false,
    },
  );

  return swr;
}

// SWR hook for job status polling
export function useJobStatus(jobId: string | null) {
  return useSWR<{ status: string; progress?: number; result?: unknown } | null>(
    jobId ? `/api/sitejson/jobs/${encodeURIComponent(jobId)}` : null,
    swrFetcher,
    {
      refreshInterval: 10000,
      revalidateOnFocus: false,
      dedupingInterval: 3000,
    },
  );
}

// SWR hook for directory data
export function useDirectory(
  type: string,
  slug: string,
  page = 1,
  pageSize = 24,
) {
  return useSWR<DirectoryResponse['data'] | null>(
    `/api/sitejson/directory/${encodeURIComponent(type)}/${encodeURIComponent(slug)}?page=${page}&page_size=${pageSize}`,
    swrFetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 10000,
      keepPreviousData: true,
    },
  );
}
