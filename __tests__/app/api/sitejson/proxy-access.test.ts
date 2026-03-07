import { beforeEach, describe, expect, it, vi } from 'vitest';
import { rateLimitedProxy } from '@/app/api/sitejson/_lib';
import { resolveSessionFromRequest } from '@/lib/auth/session';
import { resetEntitlementsTestState, setManualPlanForUser } from '@/lib/entitlements';
import {
  getStarterCreditsSummary,
  resetStarterCreditsTestState,
  reserveStarterCredits,
} from '@/lib/starter-credits';

vi.mock('@/lib/auth/session', async () => {
  const actual = await vi.importActual<typeof import('@/lib/auth/session')>('@/lib/auth/session');
  return {
    ...actual,
    resolveSessionFromRequest: vi.fn(),
  };
});

describe('SiteJSON proxy access', () => {
  const freeSession = {
    sub: 'u1',
    plan: 'free',
    authProvider: 'github',
    login: 'alice',
  } as const;

  beforeEach(() => {
    vi.clearAllMocks();
    resetStarterCreditsTestState();
    resetEntitlementsTestState();
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    })));
  });

  it('blocks anonymous access on non-public routes', async () => {
    vi.mocked(resolveSessionFromRequest).mockResolvedValueOnce(null);
    const request = new Request('https://sitejson.com/api/sitejson/sites/openai.com');

    const response = await rateLimitedProxy(request, '/api/v1/ingest/domains');
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error.code).toBe('API_KEY_REQUIRED');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('allows public health route without authentication', async () => {
    vi.mocked(resolveSessionFromRequest).mockResolvedValueOnce(null);
    const request = new Request('https://sitejson.com/api/sitejson/health');

    const response = await rateLimitedProxy(request, '/api/v1/healthz');

    expect(response.status).toBe(200);
    expect(fetch).toHaveBeenCalledOnce();
  });

  it('deducts one starter credit for free authenticated API requests', async () => {
    vi.mocked(resolveSessionFromRequest).mockResolvedValueOnce(freeSession as never);

    const request = new Request('https://sitejson.com/api/sitejson/sites/openai.com');
    const response = await rateLimitedProxy(request, '/api/v1/ingest/domains');
    const summary = await getStarterCreditsSummary(freeSession);

    expect(response.status).toBe(200);
    expect(summary.remainingCredits).toBe(199);
    expect(response.headers.get('x-sitejson-credits-remaining')).toBe('199');
    expect(response.headers.get('x-sitejson-credit-cost')).toBe('1');
    expect(response.headers.get('x-sitejson-plan')).toBe('free');
  });

  it('refunds reserved starter credit when upstream fails with 5xx', async () => {
    vi.mocked(resolveSessionFromRequest).mockResolvedValueOnce(freeSession as never);
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ ok: false }), {
        status: 503,
        headers: { 'content-type': 'application/json' },
      })),
    );

    const request = new Request('https://sitejson.com/api/sitejson/sites/openai.com');
    const response = await rateLimitedProxy(request, '/api/v1/ingest/domains');
    const summary = await getStarterCreditsSummary(freeSession);

    expect(response.status).toBe(503);
    expect(summary.remainingCredits).toBe(200);
    expect(response.headers.get('x-sitejson-credit-refunded')).toBe('1');
    expect(response.headers.get('x-sitejson-credit-cost')).toBe('0');
  });

  it('blocks requests after free starter credits are exhausted', async () => {
    await reserveStarterCredits(freeSession, {
      amount: 200,
      endpoint: '/api/v1/sites/bootstrap',
      method: 'GET',
      requestId: 'req-bootstrap',
    });
    vi.mocked(resolveSessionFromRequest).mockResolvedValueOnce(freeSession as never);

    const request = new Request('https://sitejson.com/api/sitejson/sites/openai.com');
    const response = await rateLimitedProxy(request, '/api/v1/ingest/domains');
    const body = await response.json();

    expect(response.status).toBe(402);
    expect(body.error.code).toBe('STARTER_CREDITS_EXHAUSTED');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('charges pro monthly quota before touching starter credits', async () => {
    await setManualPlanForUser(
      {
        sub: freeSession.sub,
        login: freeSession.login,
      },
      {
        plan: 'pro',
        billingAnchorAt: '2026-03-05T08:00:00.000Z',
      },
    );
    vi.mocked(resolveSessionFromRequest).mockResolvedValueOnce(freeSession as never);

    const request = new Request('https://sitejson.com/api/sitejson/sites/openai.com');
    const response = await rateLimitedProxy(request, '/api/v1/ingest/domains');
    const summary = await getStarterCreditsSummary(freeSession);

    expect(response.status).toBe(200);
    expect(summary.remainingCredits).toBe(200);
    expect(response.headers.get('x-sitejson-plan')).toBe('pro');
    expect(response.headers.get('x-sitejson-monthly-quota-remaining')).toBe('999');
    expect(response.headers.get('x-sitejson-quota-cost')).toBe('1');
  });
});
