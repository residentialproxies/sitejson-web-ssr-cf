import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getSessionFromRequest } from '@/lib/auth/session';
import { requireOpsAccess, requireReadinessAccess } from '@/app/api/sitejson/_auth';

vi.mock('@/lib/auth/session', () => ({
  getSessionFromRequest: vi.fn(),
}));

describe('SiteJSON API auth guards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.SITEJSON_INTERNAL_OPS_USERS;
    delete process.env.SITEJSON_READY_CHECK_TOKEN;
  });

  afterEach(() => {
    delete process.env.SITEJSON_INTERNAL_OPS_USERS;
    delete process.env.SITEJSON_READY_CHECK_TOKEN;
  });

  it('requires session for ops endpoints', async () => {
    vi.mocked(getSessionFromRequest).mockResolvedValueOnce(null);
    const request = new Request('http://localhost:3000/api/sitejson/ops/dashboard');

    const denied = await requireOpsAccess(request);

    expect(denied?.status).toBe(401);
    const body = await denied?.json();
    expect(body?.error?.code).toBe('UNAUTHORIZED');
  });

  it('enforces optional ops allowlist when configured', async () => {
    process.env.SITEJSON_INTERNAL_OPS_USERS = 'alice,bob';
    vi.mocked(getSessionFromRequest).mockResolvedValueOnce({
      sub: 'u1',
      plan: 'github',
      login: 'charlie',
    } as never);
    const request = new Request('http://localhost:3000/api/sitejson/ops/dashboard');

    const denied = await requireOpsAccess(request);

    expect(denied?.status).toBe(403);
    const body = await denied?.json();
    expect(body?.error?.code).toBe('FORBIDDEN');
  });

  it('accepts readiness token when configured', async () => {
    process.env.SITEJSON_READY_CHECK_TOKEN = 'ready-secret';
    const request = new Request('http://localhost:3000/api/sitejson/health?check=ready', {
      headers: {
        'x-sitejson-ready-token': 'ready-secret',
      },
    });

    const denied = await requireReadinessAccess(request);

    expect(denied).toBeNull();
  });

  it('falls back to ops access for readiness when no token configured', async () => {
    vi.mocked(getSessionFromRequest).mockResolvedValueOnce({
      sub: 'u1',
      plan: 'github',
      login: 'alice',
    } as never);
    const request = new Request('http://localhost:3000/api/sitejson/health?check=ready');

    const denied = await requireReadinessAccess(request);

    expect(denied).toBeNull();
  });
});
