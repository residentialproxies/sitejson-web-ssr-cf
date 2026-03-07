import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getUserEntitlements,
  refundMonthlyQuota,
  reserveMonthlyQuota,
  resetEntitlementsTestState,
  setManualPlanForUser,
} from '@/lib/entitlements';
import { FREE_RATE_LIMIT_RPM, FREE_STARTER_CREDITS, PRO_MONTHLY_QUOTA, PRO_RATE_LIMIT_RPM } from '@/lib/auth/session';
import { resetStarterCreditsTestState } from '@/lib/starter-credits';

const identity = {
  sub: 'u1',
  login: 'alice',
} as const;

describe('account entitlements', () => {
  beforeEach(() => {
    resetEntitlementsTestState();
    resetStarterCreditsTestState();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('defaults new users to free with starter credits and no active pro cycle', async () => {
    const entitlements = await getUserEntitlements(identity);

    expect(entitlements.plan).toBe('free');
    expect(entitlements.rateLimitPerMinute).toBe(FREE_RATE_LIMIT_RPM);
    expect(entitlements.starterCredits.totalCredits).toBe(FREE_STARTER_CREDITS);
    expect(entitlements.monthlyQuota.active).toBe(false);
    expect(entitlements.monthlyQuota.total).toBe(0);
  });

  it('activates pro manually and consumes monthly quota without touching starter credits', async () => {
    await setManualPlanForUser(identity, {
      plan: 'pro',
      billingAnchorAt: '2026-03-05T08:00:00.000Z',
    });

    const charged = await reserveMonthlyQuota(identity);
    expect(charged.applied).toBe(true);
    expect(charged.summary.total).toBe(PRO_MONTHLY_QUOTA);
    expect(charged.summary.remaining).toBe(PRO_MONTHLY_QUOTA - 1);

    const refunded = await refundMonthlyQuota(identity);
    expect(refunded.applied).toBe(true);
    expect(refunded.summary.remaining).toBe(PRO_MONTHLY_QUOTA);

    const entitlements = await getUserEntitlements(identity);
    expect(entitlements.plan).toBe('pro');
    expect(entitlements.monthlyQuota.active).toBe(true);
    expect(entitlements.monthlyQuota.remaining).toBe(PRO_MONTHLY_QUOTA);
    expect(entitlements.starterCredits.remainingCredits).toBe(FREE_STARTER_CREDITS);
    expect(entitlements.rateLimitPerMinute).toBe(PRO_RATE_LIMIT_RPM);
  });

  it('resolves month-end billing anchors onto the last valid day of shorter months', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-28T10:00:00.000Z'));

    await setManualPlanForUser(identity, {
      plan: 'pro',
      billingAnchorAt: '2026-01-31T10:00:00.000Z',
    });

    const entitlements = await getUserEntitlements(identity);

    expect(entitlements.monthlyQuota.active).toBe(true);
    expect(entitlements.monthlyQuota.cycleStartAt).toBe('2026-02-28T10:00:00.000Z');
    expect(entitlements.monthlyQuota.resetAt).toBe('2026-03-31T10:00:00.000Z');
  });

  it('blocks reservation when quota is exhausted', async () => {
    await setManualPlanForUser(identity, {
      plan: 'pro',
      billingAnchorAt: '2026-03-01T00:00:00.000Z',
    });

    // Consume the entire quota
    for (let i = 0; i < PRO_MONTHLY_QUOTA; i++) {
      const result = await reserveMonthlyQuota(identity);
      expect(result.applied).toBe(true);
    }

    // Next reservation should be blocked
    const blocked = await reserveMonthlyQuota(identity);
    expect(blocked.applied).toBe(false);
    expect(blocked.summary.remaining).toBe(0);
  });

  it('floors refund at zero (no negative usage)', async () => {
    await setManualPlanForUser(identity, {
      plan: 'pro',
      billingAnchorAt: '2026-03-01T00:00:00.000Z',
    });

    // Refund without any prior usage
    const result = await refundMonthlyQuota(identity);
    expect(result.applied).toBe(true);
    expect(result.summary.used).toBe(0);
    expect(result.summary.remaining).toBe(PRO_MONTHLY_QUOTA);
  });

  it('returns applied: false for free user quota mutation', async () => {
    const result = await reserveMonthlyQuota(identity);
    expect(result.applied).toBe(false);
    expect(result.summary.active).toBe(false);
  });

  it('handles year-end billing cycle transition (Dec 31 anchor)', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2027-01-15T12:00:00.000Z'));

    await setManualPlanForUser(identity, {
      plan: 'pro',
      billingAnchorAt: '2026-12-31T12:00:00.000Z',
    });

    const entitlements = await getUserEntitlements(identity);

    expect(entitlements.monthlyQuota.active).toBe(true);
    expect(entitlements.monthlyQuota.cycleStartAt).toBe('2026-12-31T12:00:00.000Z');
    // Jan has 31 days, so next cycle starts Jan 31
    expect(entitlements.monthlyQuota.resetAt).toBe('2027-01-31T12:00:00.000Z');
  });

  it('rate limit tiers match exported constants', async () => {
    const freeEntitlements = await getUserEntitlements(identity);
    expect(freeEntitlements.rateLimitPerMinute).toBe(FREE_RATE_LIMIT_RPM);

    await setManualPlanForUser(identity, {
      plan: 'pro',
      billingAnchorAt: '2026-03-01T00:00:00.000Z',
    });

    const proEntitlements = await getUserEntitlements(identity);
    expect(proEntitlements.rateLimitPerMinute).toBe(PRO_RATE_LIMIT_RPM);
  });
});
