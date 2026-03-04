import { NextResponse } from 'next/server';
import { checkRateLimit } from './_rate-limit';
import { getSessionFromRequest } from '@/lib/auth/session';

const defaultTimeoutMs = 15000;

// Cache configuration by path pattern
const CACHE_CONFIG: Record<string, { sMaxAge: number; staleWhileRevalidate: number }> = {
  '/api/v1/sites/': { sMaxAge: 300, staleWhileRevalidate: 600 },
  '/api/v1/directory/': { sMaxAge: 300, staleWhileRevalidate: 86400 },
  '/api/v1/jobs/': { sMaxAge: 0, staleWhileRevalidate: 0 },
  '/api/v1/ops/': { sMaxAge: 0, staleWhileRevalidate: 0 },
  '/api/v1/ingest/': { sMaxAge: 0, staleWhileRevalidate: 0 },
  '/api/v1/healthz': { sMaxAge: 10, staleWhileRevalidate: 10 },
  '/api/v1/readyz': { sMaxAge: 10, staleWhileRevalidate: 10 },
  default: { sMaxAge: 60, staleWhileRevalidate: 300 },
};

const getCacheConfig = (path: string) => {
  for (const [pattern, config] of Object.entries(CACHE_CONFIG)) {
    if (path.includes(pattern)) return config;
  }
  return CACHE_CONFIG.default;
};

const parseJson = (text: string): unknown => {
  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return {
      ok: false,
      error: {
        code: 'UPSTREAM_INVALID_JSON',
        message: 'Upstream returned invalid JSON',
      },
      raw: text,
    };
  }
};

const getBackendBaseUrl = (): string => {
  return (
    process.env.SITEJSON_API_BASE_URL ??
    process.env.NEXT_PUBLIC_SITEJSON_API_BASE_URL ??
    'http://127.0.0.1:8787'
  );
};

const getTimeoutMs = (): number => {
  const raw = Number(process.env.SITEJSON_PROXY_TIMEOUT_MS ?? defaultTimeoutMs);
  if (Number.isFinite(raw) && raw > 0) {
    return raw;
  }
  return defaultTimeoutMs;
};

const createHeaders = (
  headers?: HeadersInit,
  auth?: {
    plan: 'github' | 'pro';
    userId: string;
  },
): Headers => {
  const merged = new Headers(headers);

  const apiKey = process.env.SITEJSON_API_KEY;
  if (apiKey && apiKey.trim()) {
    merged.set('x-api-key', apiKey);
  }

  if (!merged.has('accept')) {
    merged.set('accept', 'application/json');
  }

  if (auth) {
    merged.set('x-sitejson-plan', auth.plan);
    merged.set('x-sitejson-user', auth.userId);
  }

  return merged;
};

export const rateLimitedProxy = async (
  request: Request,
  path: string,
  init?: RequestInit,
) => {
  const session = await getSessionFromRequest(request);
  const auth = session ? { plan: session.plan, userId: session.login || session.sub } : undefined;

  const rateLimit = checkRateLimit(request, auth ? { plan: auth.plan, userId: auth.userId } : { plan: 'anonymous' });
  if (rateLimit.blocked) return rateLimit.blocked;
  return proxyToSitejson(path, init, rateLimit.headers, auth);
};

export const proxyToSitejson = async (
  path: string,
  init?: RequestInit,
  rateLimitHeaders?: Record<string, string>,
  auth?: {
    plan: 'github' | 'pro';
    userId: string;
  },
) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), getTimeoutMs());

  try {
    const upstream = await fetch(`${getBackendBaseUrl()}${path}`, {
      ...init,
      headers: createHeaders(init?.headers, auth),
      signal: controller.signal,
      cache: 'no-store',
    });

    const payloadText = await upstream.text();
    const payload = parseJson(payloadText);
    const plan = rateLimitHeaders?.['x-sitejson-plan'] ?? auth?.plan ?? 'anonymous';

    const responseHeaders: Record<string, string> = {
      'content-type': 'application/json',
      'x-sitejson-plan': plan,
      ...rateLimitHeaders,
    };

    // Add cache headers based on path
    const cacheConfig = getCacheConfig(path);
    if (cacheConfig.sMaxAge > 0) {
      responseHeaders['cache-control'] = `public, s-maxage=${cacheConfig.sMaxAge}, stale-while-revalidate=${cacheConfig.staleWhileRevalidate}`;
    } else {
      responseHeaders['cache-control'] = 'no-store, must-revalidate';
    }

    return NextResponse.json(payload, {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'UPSTREAM_UNAVAILABLE',
          message: error instanceof Error ? error.message : 'Failed to reach SiteJSON backend',
        },
      },
      {
        status: 502,
        headers: {
          'x-sitejson-plan': rateLimitHeaders?.['x-sitejson-plan'] ?? auth?.plan ?? 'anonymous',
          ...(rateLimitHeaders ?? {}),
          'cache-control': 'no-store',
        },
      },
    );
  } finally {
    clearTimeout(timeout);
  }
};
