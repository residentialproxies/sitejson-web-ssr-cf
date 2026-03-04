/**
 * Edge-compatible in-memory sliding window rate limiter with plan tiers.
 */

import { NextResponse } from 'next/server';

export type PlanTier = 'anonymous' | 'github' | 'pro';

interface WindowEntry {
  timestamps: number[];
}

export interface RateLimitResult {
  blocked: NextResponse | null;
  headers: Record<string, string>;
  plan: PlanTier;
  limit: number;
}

export interface RateLimitIdentity {
  plan?: PlanTier;
  userId?: string;
}

const windows = new Map<string, WindowEntry>();

const WINDOW_MS = 60_000;
const CLEANUP_INTERVAL = 120_000;
const VALID_PLAN_TIERS = new Set<PlanTier>(['anonymous', 'github', 'pro']);
const DEFAULT_LIMITS: Record<PlanTier, number> = {
  anonymous: 10,
  github: 30,
  pro: 100,
};

let lastCleanup = Date.now();

function readPositiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return Math.floor(parsed);
}

function getPlanLimits(): Record<PlanTier, number> {
  return {
    anonymous: readPositiveInt(process.env.SITEJSON_RATE_LIMIT_ANONYMOUS_RPM, DEFAULT_LIMITS.anonymous),
    github: readPositiveInt(process.env.SITEJSON_RATE_LIMIT_GITHUB_RPM, DEFAULT_LIMITS.github),
    pro: readPositiveInt(process.env.SITEJSON_RATE_LIMIT_PRO_RPM, DEFAULT_LIMITS.pro),
  };
}

function cleanup(now: number) {
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, entry] of windows) {
    entry.timestamps = entry.timestamps.filter((t) => now - t < WINDOW_MS);
    if (entry.timestamps.length === 0) windows.delete(key);
  }
}

function getClientIp(request: Request): string {
  const headers = new Headers(request.headers);
  return (
    headers.get('cf-connecting-ip') ??
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    headers.get('x-real-ip') ??
    '127.0.0.1'
  );
}

function resolvePlanTier(identity?: RateLimitIdentity): PlanTier {
  const overridePlan = identity?.plan;
  if (overridePlan && VALID_PLAN_TIERS.has(overridePlan)) {
    return overridePlan;
  }

  return 'anonymous';
}

function resolveIdentityKey(request: Request, plan: PlanTier, identity?: RateLimitIdentity): string {
  const ip = getClientIp(request);
  if (plan === 'anonymous') {
    return ip;
  }

  if (identity?.userId?.trim()) {
    return `${plan}:${identity.userId.trim().toLowerCase()}`;
  }

  return `${plan}:${ip}`;
}

function buildRateLimitHeaders(
  limit: number,
  remaining: number,
  resetAtMs: number,
  plan: PlanTier,
  retryAfterSeconds?: number,
): Record<string, string> {
  const headers: Record<string, string> = {
    'x-ratelimit-limit': String(limit),
    'x-ratelimit-remaining': String(Math.max(remaining, 0)),
    'x-ratelimit-reset': String(Math.ceil(resetAtMs / 1000)),
    'x-sitejson-plan': plan,
  };

  if (typeof retryAfterSeconds === 'number') {
    headers['retry-after'] = String(Math.max(1, retryAfterSeconds));
  }

  return headers;
}

export function checkRateLimit(request: Request, identity?: RateLimitIdentity): RateLimitResult {
  const now = Date.now();
  cleanup(now);

  const plan = resolvePlanTier(identity);
  const limits = getPlanLimits();
  const limit = limits[plan];
  const identityKey = resolveIdentityKey(request, plan, identity);
  const url = new URL(request.url);
  const key = `${identityKey}:${url.pathname}`;

  const entry = windows.get(key) ?? { timestamps: [] };
  entry.timestamps = entry.timestamps.filter((t) => now - t < WINDOW_MS);

  const oldestInWindow = entry.timestamps[0] ?? now;
  const resetAtMs = oldestInWindow + WINDOW_MS;

  if (entry.timestamps.length >= limit) {
    const retryAfter = Math.ceil((resetAtMs - now) / 1000);
    const headers = buildRateLimitHeaders(limit, 0, resetAtMs, plan, retryAfter);

    return {
      blocked: NextResponse.json(
        {
          ok: false,
          error: {
            code: 'RATE_LIMITED',
            message: `Too many requests. Limit: ${limit} req/min for ${plan} plan.`,
          },
        },
        {
          status: 429,
          headers: {
            ...headers,
            'cache-control': 'no-store',
          },
        },
      ),
      headers,
      plan,
      limit,
    };
  }

  entry.timestamps.push(now);
  windows.set(key, entry);

  const remaining = limit - entry.timestamps.length;
  const currentOldest = entry.timestamps[0] ?? now;
  const headers = buildRateLimitHeaders(limit, remaining, currentOldest + WINDOW_MS, plan);

  return {
    blocked: null,
    headers,
    plan,
    limit,
  };
}
