import type { ApiResponse } from '../lib/types';
import type { SiteReport, SiteReportResponse, DirectoryItem, AlternativeSite } from '../lib/api-client/types';

type BackendAnalyzeResponse = {
  ok?: boolean;
  data?: {
    job_id?: string | null;
    status?: string;
    priority?: string;
    reason?: string;
  };
  error?: { code?: string; message?: string };
};

type BackendJobResponse = {
  ok?: boolean;
  data?: {
    job_id?: string;
    status?: 'pending' | 'running' | 'completed' | 'failed';
    progress?: number;
    stage?: string;
  };
  error?: { code?: string; message?: string };
};

type BackendDirectoryResponse = {
  ok?: boolean;
  data?: {
    items?: DirectoryItem[];
    pagination?: {
      page?: number;
      page_size?: number;
      total?: number;
    };
  };
};

type BackendAlternativesResponse = {
  ok?: boolean;
  data?: {
    algorithm?: string;
    items?: AlternativeSite[];
  };
  error?: { code?: string; message?: string };
};

export type DirectoryListingResult = {
  items: DirectoryItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

const pendingJobs = new Map<string, string>();
const pendingWithoutJob = new Set<string>();

const parseJson = <T>(text: string): T | null => {
  if (!text) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
};

const requestJson = async <T>(path: string, init?: RequestInit): Promise<{ status: number; body: T | null }> => {
  try {
    const response = await fetch(path, {
      ...init,
      cache: 'no-store',
      headers: {
        accept: 'application/json',
        ...(init?.headers ?? {}),
      },
    });
    const text = await response.text();
    return { status: response.status, body: parseJson<T>(text) };
  } catch {
    return { status: 0, body: null };
  }
};

const normalizeDomain = (input: string): string => {
  return input
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split('/')[0] ?? '';
};

const startAnalysis = async (
  domain: string,
  forceRefresh: boolean,
): Promise<{ jobId?: string; processing: boolean; message?: string; error?: string }> => {
  const response = await requestJson<BackendAnalyzeResponse>('/api/sitejson/analyze', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      domain,
      force_refresh: forceRefresh,
      force_ai: forceRefresh,
      priority: 'high',
    }),
  });

  if (response.status === 202 && response.body?.ok) {
    const jobId = response.body.data?.job_id ?? undefined;
    if (jobId) return { jobId, processing: true, message: 'Analysis queued' };
    return { processing: false };
  }

  if (response.status === 409 && response.body?.error?.code === 'JOB_ALREADY_RUNNING') {
    return { processing: true, message: 'Analysis already running' };
  }

  return { processing: false, error: response.body?.error?.message ?? 'Failed to start analysis' };
};

const readJobStatus = async (
  jobId: string,
): Promise<{ state: 'processing' | 'completed' | 'failed'; message?: string; progress?: number; stage?: string }> => {
  const response = await requestJson<BackendJobResponse>(`/api/sitejson/jobs/${encodeURIComponent(jobId)}`);

  if (response.status === 200 && response.body?.ok && response.body.data) {
    const status = response.body.data.status;
    if (status === 'completed') return { state: 'completed' };
    if (status === 'failed') return { state: 'failed', message: 'Analysis worker failed' };
    return {
      state: 'processing',
      message: response.body.data.stage ?? 'Analyzing',
      progress: response.body.data.progress,
      stage: response.body.data.stage,
    };
  }

  if (response.status === 404) {
    return { state: 'processing', message: 'Awaiting job visibility' };
  }

  return { state: 'failed', message: response.body?.error?.message ?? 'Failed to poll job status' };
};

const readSiteReport = async (domain: string) => {
  return requestJson<SiteReportResponse>(`/api/sitejson/sites/${encodeURIComponent(domain)}`);
};

const extractReport = (body: SiteReportResponse): { report: SiteReport; isStale: boolean } => {
  const report = { ...(body.data?.report ?? {}) };
  if (body.data?.domain && !report.domain) {
    report.domain = body.data.domain;
  }
  return {
    report,
    isStale: Boolean(body.data?.freshness?.is_stale),
  };
};

export const fetchSiteData = async (domainInput: string, refresh = false): Promise<ApiResponse> => {
  const domain = normalizeDomain(domainInput);

  if (!domain || !domain.includes('.')) {
    return { status: 'error', message: 'Invalid domain' };
  }

  if (refresh) {
    pendingJobs.delete(domain);
    pendingWithoutJob.delete(domain);

    const started = await startAnalysis(domain, true);
    if (started.error) return { status: 'error', message: started.error };

    if (started.processing) {
      if (started.jobId) pendingJobs.set(domain, started.jobId);
      else pendingWithoutJob.add(domain);
      return { status: 'processing', message: started.message ?? 'Analysis queued', progress: 5, stage: 'queued' };
    }
  }

  const trackedJob = pendingJobs.get(domain);
  if (trackedJob) {
    const status = await readJobStatus(trackedJob);
    if (status.state === 'completed') {
      pendingJobs.delete(domain);
      pendingWithoutJob.add(domain);
    } else if (status.state === 'failed') {
      pendingJobs.delete(domain);
      return { status: 'error', message: status.message ?? 'Analysis failed' };
    } else {
      return { status: 'processing', message: status.message ?? 'Analyzing...', progress: status.progress, stage: status.stage };
    }
  }

  const reportResponse = await readSiteReport(domain);
  if (reportResponse.status === 200 && reportResponse.body?.ok) {
    pendingWithoutJob.delete(domain);
    const { report, isStale } = extractReport(reportResponse.body);
    return { status: 'completed', data: report, is_stale: isStale };
  }

  if (pendingWithoutJob.has(domain) && reportResponse.status === 404) {
    return { status: 'processing', message: 'Analysis running...', progress: 25, stage: 'orchestrator' };
  }

  if (reportResponse.status === 404) {
    const started = await startAnalysis(domain, false);
    if (started.error) return { status: 'error', message: started.error };

    if (started.processing) {
      if (started.jobId) pendingJobs.set(domain, started.jobId);
      else pendingWithoutJob.add(domain);
      return { status: 'processing', message: started.message ?? 'Analysis queued', progress: 5, stage: 'queued' };
    }

    const refetched = await readSiteReport(domain);
    if (refetched.status === 200 && refetched.body?.ok) {
      const { report, isStale } = extractReport(refetched.body);
      return { status: 'completed', data: report, is_stale: isStale };
    }
  }

  return { status: 'error', message: reportResponse.body?.error?.message ?? 'Failed to load site report' };
};

export const fetchDirectoryListing = async (
  type: string,
  value: string,
  page = 1,
  pageSize = 24,
  options?: { sort?: string; minScore?: number; hasTraffic?: boolean },
): Promise<DirectoryListingResult> => {
  let qs = `page=${encodeURIComponent(String(page))}&page_size=${encodeURIComponent(String(pageSize))}`;
  if (options?.sort) qs += `&sort=${encodeURIComponent(options.sort)}`;
  if (options?.minScore !== undefined) qs += `&min_score=${options.minScore}`;
  if (options?.hasTraffic) qs += `&has_traffic=true`;

  const response = await requestJson<BackendDirectoryResponse>(
    `/api/sitejson/directory/${encodeURIComponent(type)}/${encodeURIComponent(value)}?${qs}`,
  );

  if (response.status !== 200 || !response.body?.ok) {
    return { items: [], page, pageSize, total: 0, totalPages: 0 };
  }

  const items = (response.body.data?.items ?? []).filter(
    (item): item is DirectoryItem => Boolean(item?.domain),
  );
  const normalizedPage = response.body.data?.pagination?.page ?? page;
  const normalizedPageSize = response.body.data?.pagination?.page_size ?? pageSize;
  const total = response.body.data?.pagination?.total ?? items.length;

  return {
    items,
    page: normalizedPage,
    pageSize: normalizedPageSize,
    total,
    totalPages: total > 0 ? Math.ceil(total / normalizedPageSize) : 0,
  };
};

export const fetchAlternatives = async (domain: string): Promise<AlternativeSite[]> => {
  const response = await requestJson<BackendAlternativesResponse>(
    `/api/sitejson/sites/${encodeURIComponent(domain)}/alternatives`,
  );

  if (response.status !== 200 || !response.body?.ok) return [];
  return response.body.data?.items ?? [];
};
