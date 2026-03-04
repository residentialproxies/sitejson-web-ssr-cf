import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { checkRateLimit } from '@/app/api/sitejson/_rate-limit';

const createRequest = (path: string, ip: string) =>
  new Request(`https://sitejson.com${path}`, {
    headers: {
      'cf-connecting-ip': ip,
    },
  });

describe('Rate Limit Tiers', () => {
  beforeEach(() => {
    process.env.SITEJSON_RATE_LIMIT_ANONYMOUS_RPM = '10';
    process.env.SITEJSON_RATE_LIMIT_GITHUB_RPM = '30';
    process.env.SITEJSON_RATE_LIMIT_PRO_RPM = '100';
  });

  afterEach(() => {
    delete process.env.SITEJSON_RATE_LIMIT_ANONYMOUS_RPM;
    delete process.env.SITEJSON_RATE_LIMIT_GITHUB_RPM;
    delete process.env.SITEJSON_RATE_LIMIT_PRO_RPM;
  });

  it('enforces 10 req/min for anonymous account', async () => {
    const request = createRequest('/api/sitejson/health', '198.51.100.10');

    for (let i = 0; i < 10; i += 1) {
      const result = checkRateLimit(request, { plan: 'anonymous' });
      expect(result.blocked).toBeNull();
      expect(result.headers['x-ratelimit-limit']).toBe('10');
      expect(result.plan).toBe('anonymous');
    }

    const blocked = checkRateLimit(request, { plan: 'anonymous' });
    expect(blocked.blocked?.status).toBe(429);
    expect(blocked.headers['x-ratelimit-limit']).toBe('10');
    const body = await blocked.blocked?.json();
    expect(body?.error?.code).toBe('RATE_LIMITED');
  });

  it('enforces 30 req/min for github account', async () => {
    const request = createRequest('/api/sitejson/sites/openai.com', '198.51.100.20');

    for (let i = 0; i < 30; i += 1) {
      const result = checkRateLimit(request, { plan: 'github', userId: 'github-user-1' });
      expect(result.blocked).toBeNull();
      expect(result.headers['x-ratelimit-limit']).toBe('30');
      expect(result.plan).toBe('github');
    }

    const blocked = checkRateLimit(request, { plan: 'github', userId: 'github-user-1' });
    expect(blocked.blocked?.status).toBe(429);
    expect(blocked.headers['x-ratelimit-limit']).toBe('30');
    const body = await blocked.blocked?.json();
    expect(body?.error?.code).toBe('RATE_LIMITED');
  });

  it('enforces 100 req/min for pro account', async () => {
    const request = createRequest('/api/sitejson/ops/dashboard', '198.51.100.30');

    for (let i = 0; i < 100; i += 1) {
      const result = checkRateLimit(request, { plan: 'pro', userId: 'pro-user-1' });
      expect(result.blocked).toBeNull();
      expect(result.headers['x-ratelimit-limit']).toBe('100');
      expect(result.plan).toBe('pro');
    }

    const blocked = checkRateLimit(request, { plan: 'pro', userId: 'pro-user-1' });
    expect(blocked.blocked?.status).toBe(429);
    expect(blocked.headers['x-ratelimit-limit']).toBe('100');
    const body = await blocked.blocked?.json();
    expect(body?.error?.code).toBe('RATE_LIMITED');
  });
});
