import { beforeEach, describe, expect, it } from 'vitest';
import {
  getStarterCreditsSummary,
  listRecentStarterCreditActivity,
  refundStarterCredits,
  reserveStarterCredits,
  resetStarterCreditsTestState,
} from '@/lib/starter-credits';

const session = {
  sub: 'u1',
  login: 'alice',
  plan: 'free',
} as const;

describe('starter credits', () => {
  beforeEach(() => {
    resetStarterCreditsTestState();
  });

  it('bootstraps 200 starter requests with a grant ledger entry', async () => {
    const summary = await getStarterCreditsSummary(session);
    const activity = await listRecentStarterCreditActivity(session, 5);

    expect(summary.totalCredits).toBe(200);
    expect(summary.remainingCredits).toBe(200);
    expect(summary.usedCredits).toBe(0);
    expect(activity[0]?.reason).toBe('starter_grant');
    expect(activity[0]?.delta).toBe(200);
  });

  it('charges and refunds starter credits with durable activity records', async () => {
    const charged = await reserveStarterCredits(session, {
      endpoint: '/api/v1/sites/openai.com',
      method: 'GET',
      requestId: 'req-1',
    });

    expect(charged.applied).toBe(true);
    expect(charged.summary.remainingCredits).toBe(199);
    expect(charged.summary.usedCredits).toBe(1);

    const refunded = await refundStarterCredits(session, {
      endpoint: '/api/v1/sites/openai.com',
      method: 'GET',
      requestId: 'req-1',
    });

    expect(refunded.applied).toBe(true);
    expect(refunded.summary.remainingCredits).toBe(200);
    expect(refunded.summary.usedCredits).toBe(0);

    const activity = await listRecentStarterCreditActivity(session, 5);
    expect(activity.map((item) => item.reason)).toEqual(['api_refund', 'api_request', 'starter_grant']);
  });

  it('blocks further usage after starter credits are exhausted', async () => {
    const firstCharge = await reserveStarterCredits(session, {
      amount: 200,
      endpoint: '/api/v1/sites/openai.com',
      method: 'GET',
      requestId: 'req-bulk',
    });

    expect(firstCharge.applied).toBe(true);
    expect(firstCharge.summary.remainingCredits).toBe(0);
    expect(firstCharge.summary.exhausted).toBe(true);

    const denied = await reserveStarterCredits(session, {
      endpoint: '/api/v1/sites/github.com',
      method: 'GET',
      requestId: 'req-over',
    });

    expect(denied.applied).toBe(false);
    expect(denied.summary.remainingCredits).toBe(0);
    expect(denied.summary.usedCredits).toBe(200);
  });
});
