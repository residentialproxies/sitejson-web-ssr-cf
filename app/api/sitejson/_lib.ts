import { NextResponse } from 'next/server';
import { checkRateLimit } from './_rate-limit';
import { requireApiAccess } from './_auth';
import { readRuntimeEnv } from '@/lib/runtime-env';
import { resolveSessionFromRequest } from '@/lib/auth/session';
import { resolveStoredScreenshotUrl } from '@/lib/screenshot-url';
import {
  createMonthlyQuotaHeaders,
  getUserEntitlements,
  isAccountEntitlementsConfigurationError,
  refundMonthlyQuota,
  reserveMonthlyQuota,
} from '@/lib/entitlements';
import {
  createStarterCreditsHeaders,
  isStarterCreditsConfigurationError,
  refundStarterCredits,
  reserveStarterCredits,
} from '@/lib/starter-credits';

const defaultTimeoutMs = 15000;
const PUBLIC_PROXY_PATHS = new Set(['/api/v1/healthz', '/api/v1/readyz', '/api/v1/insights']);
const PUBLIC_READ_PREFIXES = ['/api/v1/directory/', '/api/v1/sites/'];

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

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const normalizeScreenshotUrls = (payload: unknown): unknown => {
  if (!isPlainObject(payload) || payload.ok !== true) {
    return payload;
  }

  const data = payload.data;
  if (!isPlainObject(data)) {
    return payload;
  }

  const reportPayload = data.report;
  if (isPlainObject(reportPayload)) {
    const reportDomain =
      (typeof data.domain === 'string' && data.domain.trim().length > 0 ? data.domain : undefined)
      ?? (typeof reportPayload.domain === 'string' && reportPayload.domain.trim().length > 0 ? reportPayload.domain : undefined);

    const visualPayload = reportDomain && isPlainObject(reportPayload.visual) ? reportPayload.visual : undefined;
    if (reportDomain && visualPayload) {
      const upstreamUrl = typeof visualPayload.screenshotUrl === 'string' ? visualPayload.screenshotUrl : undefined;
      const resolvedUrl = resolveStoredScreenshotUrl(reportDomain, upstreamUrl);
      if (resolvedUrl !== upstreamUrl) {
        const nextVisual: Record<string, unknown> = { ...visualPayload };
        if (resolvedUrl) nextVisual.screenshotUrl = resolvedUrl;
        else delete nextVisual.screenshotUrl;

        return {
          ...payload,
          data: {
            ...data,
            report: {
              ...reportPayload,
              visual: nextVisual,
            },
          },
        };
      }
    }
  }

  if (Array.isArray(data.items)) {
    const nextItems = data.items.map((item) => {
      if (!isPlainObject(item)) return item;
      const domain = typeof item.domain === 'string' ? item.domain : '';
      if (!domain) return item;

      const upstreamUrl = typeof item.screenshotUrl === 'string' ? item.screenshotUrl : undefined;
      const resolvedUrl = resolveStoredScreenshotUrl(domain, upstreamUrl);
      if (resolvedUrl === upstreamUrl) return item;

      const nextItem: Record<string, unknown> = { ...item };
      if (resolvedUrl) nextItem.screenshotUrl = resolvedUrl;
      else delete nextItem.screenshotUrl;
      return nextItem;
    });

    return {
      ...payload,
      data: {
        ...data,
        items: nextItems,
      },
    };
  }

  return payload;
};

const getBackendBaseUrl = (): string => {
  return (
    readRuntimeEnv('SITEJSON_API_BASE_URL') ??
    readRuntimeEnv('NEXT_PUBLIC_SITEJSON_API_BASE_URL') ??
    'http://127.0.0.1:8787'
  );
};

const getTimeoutMs = (): number => {
  const raw = Number(readRuntimeEnv('SITEJSON_PROXY_TIMEOUT_MS') ?? defaultTimeoutMs);
  if (Number.isFinite(raw) && raw > 0) {
    return raw;
  }
  return defaultTimeoutMs;
};

const getRequestId = (request: Request): string => {
  const forwardedRequestId =
    request.headers.get('x-request-id')?.trim() ??
    request.headers.get('cf-ray')?.trim();

  return forwardedRequestId || crypto.randomUUID();
};

const appendHeaders = (target: Headers, values?: Record<string, string>) => {
  if (!values) return;
  for (const [key, value] of Object.entries(values)) {
    target.set(key, value);
  }
};

const entitlementsUnavailableResponse = (message: string, rateLimitHeaders?: Record<string, string>) =>
  NextResponse.json(
    {
      ok: false,
      error: {
        code: 'ENTITLEMENTS_STORE_UNAVAILABLE',
        message,
      },
    },
    {
      status: 503,
      headers: {
        ...(rateLimitHeaders ?? {}),
        'cache-control': 'no-store',
      },
    },
  );

const starterCreditsExhaustedResponse = (
  summary: Parameters<typeof createStarterCreditsHeaders>[0],
  requestId: string,
  rateLimitHeaders?: Record<string, string>,
) =>
  NextResponse.json(
    {
      ok: false,
      error: {
        code: 'STARTER_CREDITS_EXHAUSTED',
        message: 'Your one-time free starter credits are exhausted. Contact hello@sitejson.com if you need more access before payments go live.',
      },
    },
    {
      status: 402,
      headers: {
        ...(rateLimitHeaders ?? {}),
        ...createStarterCreditsHeaders(summary, {
          chargedCredits: 0,
          requestId,
        }),
        'cache-control': 'no-store',
      },
    },
  );

const monthlyQuotaExhaustedResponse = (
  summary: Parameters<typeof createMonthlyQuotaHeaders>[0],
  rateLimitHeaders?: Record<string, string>,
) =>
  NextResponse.json(
    {
      ok: false,
      error: {
        code: 'PRO_MONTHLY_QUOTA_EXHAUSTED',
        message: 'Your Pro monthly quota is exhausted for the current billing cycle. Contact hello@sitejson.com if you need a temporary increase.',
      },
    },
    {
      status: 402,
      headers: {
        ...(rateLimitHeaders ?? {}),
        ...createMonthlyQuotaHeaders(summary, {
          chargedUnits: 0,
        }),
        'cache-control': 'no-store',
      },
    },
  );

const createHeaders = (
  headers?: HeadersInit,
  auth?: {
    plan: 'free' | 'pro';
    userId: string;
  },
): Headers => {
  const merged = new Headers(headers);

  const apiKey = readRuntimeEnv('SITEJSON_API_KEY');
  if (apiKey) {
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
  const isPublicPath = PUBLIC_PROXY_PATHS.has(path) || PUBLIC_READ_PREFIXES.some((prefix) => path.startsWith(prefix));
  const session = await resolveSessionFromRequest(request);

  if (!isPublicPath) {
    const denied = await requireApiAccess(request, session);
    if (denied) return denied;
  }

  const identity = session
    ? {
        sub: session.sub,
        login: session.login || session.sub,
      }
    : null;

  let entitlements: Awaited<ReturnType<typeof getUserEntitlements>> | null = null;
  if (identity) {
    try {
      entitlements = await getUserEntitlements(identity);
    } catch (error) {
      if (isStarterCreditsConfigurationError(error) || isAccountEntitlementsConfigurationError(error)) {
        return entitlementsUnavailableResponse(error.message);
      }
      throw error;
    }
  }

  const auth = session && entitlements
    ? { plan: entitlements.plan, userId: identity?.login ?? session.sub }
    : undefined;

  const rateLimit = checkRateLimit(request, auth ? { plan: auth.plan, userId: auth.userId } : { plan: 'anonymous' });
  if (rateLimit.blocked) return rateLimit.blocked;

  const method = init?.method ?? request.method;
  const requestId = getRequestId(request);
  const shouldCharge = !isPublicPath && !!session;

  let reservedCredits:
    | Awaited<ReturnType<typeof reserveStarterCredits>>
    | null = null;
  let reservedMonthlyQuota:
    | Awaited<ReturnType<typeof reserveMonthlyQuota>>
    | null = null;

  if (shouldCharge && session && identity && entitlements) {
    if (entitlements.plan === 'pro') {
      try {
        reservedMonthlyQuota = await reserveMonthlyQuota(identity);
      } catch (error) {
        if (isAccountEntitlementsConfigurationError(error)) {
          return entitlementsUnavailableResponse(error.message, rateLimit.headers);
        }
        throw error;
      }

      if (!reservedMonthlyQuota.applied) {
        return monthlyQuotaExhaustedResponse(reservedMonthlyQuota.summary, rateLimit.headers);
      }
    } else {
      try {
        reservedCredits = await reserveStarterCredits({ ...session, plan: 'free' }, {
          endpoint: path,
          method,
          requestId,
        });
      } catch (error) {
        if (isStarterCreditsConfigurationError(error)) {
          return entitlementsUnavailableResponse(error.message, rateLimit.headers);
        }
        throw error;
      }

      if (!reservedCredits.applied) {
        return starterCreditsExhaustedResponse(reservedCredits.summary, requestId, rateLimit.headers);
      }
    }
  }

  const response = await proxyToSitejson(path, init, rateLimit.headers, auth);

  if (!shouldCharge || !session || !identity || !entitlements) {
    return response;
  }

  if (response.status >= 500) {
    if (entitlements.plan === 'pro' && reservedMonthlyQuota) {
      try {
        const refunded = await refundMonthlyQuota(identity);
        appendHeaders(
          response.headers,
          createMonthlyQuotaHeaders(refunded.summary, {
            chargedUnits: 0,
            refundedUnits: 1,
          }),
        );
      } catch (error) {
        if (isAccountEntitlementsConfigurationError(error)) {
          return entitlementsUnavailableResponse(error.message, rateLimit.headers);
        }
        throw error;
      }
    } else if (reservedCredits) {
      try {
        const refunded = await refundStarterCredits({ ...session, plan: 'free' }, {
          endpoint: path,
          method,
          requestId,
        });
        appendHeaders(
          response.headers,
          createStarterCreditsHeaders(refunded.summary, {
            chargedCredits: 0,
            refundedCredits: 1,
            requestId,
          }),
        );
      } catch (error) {
        if (isStarterCreditsConfigurationError(error)) {
          return entitlementsUnavailableResponse(error.message, rateLimit.headers);
        }
        throw error;
      }
    }

    return response;
  }

  if (entitlements.plan === 'pro' && reservedMonthlyQuota) {
    appendHeaders(
      response.headers,
      createMonthlyQuotaHeaders(reservedMonthlyQuota.summary, {
        chargedUnits: 1,
      }),
    );
  } else if (reservedCredits) {
    appendHeaders(
      response.headers,
      createStarterCreditsHeaders(reservedCredits.summary, {
        chargedCredits: 1,
        requestId,
      }),
    );
  }

  return response;
};

export const proxyToSitejson = async (
  path: string,
  init?: RequestInit,
  rateLimitHeaders?: Record<string, string>,
  auth?: {
    plan: 'free' | 'pro';
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
    const payload = normalizeScreenshotUrls(parseJson(payloadText));
    const plan = rateLimitHeaders?.['x-sitejson-plan'] ?? auth?.plan ?? 'anonymous';

    const responseHeaders: Record<string, string> = {
      'content-type': 'application/json',
      'x-sitejson-plan': plan,
      ...rateLimitHeaders,
    };

    if (!upstream.ok) {
      responseHeaders['cache-control'] = 'no-store, must-revalidate';
    } else {
      const cacheConfig = getCacheConfig(path);
      if (cacheConfig.sMaxAge > 0) {
        responseHeaders['cache-control'] = `public, s-maxage=${cacheConfig.sMaxAge}, stale-while-revalidate=${cacheConfig.staleWhileRevalidate}`;
      } else {
        responseHeaders['cache-control'] = 'no-store, must-revalidate';
      }
    }

    if (!responseHeaders['cache-control']) {
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
