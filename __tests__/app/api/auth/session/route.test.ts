import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GET } from '@/app/api/auth/session/route';
import { getSessionFromRequest } from '@/lib/auth/session';
import { resetEntitlementsTestState, setManualPlanForUser } from '@/lib/entitlements';
import { resetStarterCreditsTestState, reserveStarterCredits } from '@/lib/starter-credits';

vi.mock('@/lib/auth/session', async () => {
  const actual = await vi.importActual<typeof import('@/lib/auth/session')>('@/lib/auth/session');
  return {
    ...actual,
    getSessionFromRequest: vi.fn(),
  };
});

const session = {
  sub: 'u1',
  login: 'alice',
  plan: 'free',
  authProvider: 'github',
  name: 'Alice',
  email: 'alice@example.com',
  avatarUrl: 'https://avatars.githubusercontent.com/u/1',
} as const;

describe('GET /api/auth/session', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetStarterCreditsTestState();
    resetEntitlementsTestState();
  });

  it('returns anonymous state when no session exists', async () => {
    vi.mocked(getSessionFromRequest).mockResolvedValueOnce(null);

    const response = await GET(new Request('https://sitejson.com/api/auth/session'));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.authenticated).toBe(false);
    expect(body.plan).toBe('anonymous');
  });

  it('returns live free-tier entitlements for authenticated users', async () => {
    await reserveStarterCredits(session, {
      endpoint: '/api/v1/sites/openai.com',
      method: 'GET',
      requestId: 'req-1',
    });
    vi.mocked(getSessionFromRequest).mockResolvedValueOnce(session as never);

    const response = await GET(new Request('https://sitejson.com/api/auth/session'));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.authenticated).toBe(true);
    expect(body.plan).toBe('free');
    expect(body.authProvider).toBe('github');
    expect(body.entitlements.starterCredits).toBe(200);
    expect(body.entitlements.starterCreditsRemaining).toBe(199);
    expect(body.entitlements.starterCreditsUsed).toBe(1);
    expect(body.entitlements.starterCreditsExhausted).toBe(false);
    expect(body.entitlements.monthlyQuota).toBe(0);
    expect(body.entitlements.monthlyQuotaActive).toBe(false);
    expect(body.entitlements.rateLimitPerMinute).toBe(10);
    expect(body.entitlements.billingMode).toBe('manual');
    expect(body.entitlements.paymentCheckoutAvailable).toBe(false);
  });

  it('returns active pro monthly quota for manually upgraded users', async () => {
    await setManualPlanForUser(
      {
        sub: session.sub,
        login: session.login,
      },
      {
        plan: 'pro',
        billingAnchorAt: '2026-03-05T08:00:00.000Z',
      },
    );
    vi.mocked(getSessionFromRequest).mockResolvedValueOnce(session as never);

    const response = await GET(new Request('https://sitejson.com/api/auth/session'));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.plan).toBe('pro');
    expect(body.entitlements.monthlyQuota).toBe(1000);
    expect(body.entitlements.monthlyQuotaRemaining).toBe(1000);
    expect(body.entitlements.monthlyQuotaActive).toBe(true);
    expect(body.entitlements.monthlyQuotaResetAt).toBeTruthy();
    expect(body.entitlements.rateLimitPerMinute).toBe(100);
  });
});
