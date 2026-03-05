import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextResponse } from 'next/server';
import { GET as getOpsDashboard } from '@/app/api/sitejson/ops/./dashboard/route';
import { GET as getOpsQueues } from '@/app/api/sitejson/ops/./queues/route';
import { POST as postRetryDlq } from '@/app/api/sitejson/ops/retry-dlq/route';
import { rateLimitedProxy } from '@/app/api/sitejson/_lib';
import { requireOpsAccess } from '@/app/api/sitejson/_auth';

vi.mock('@/app/api/sitejson/_lib', () => ({
  rateLimitedProxy: vi.fn(),
}));

vi.mock('@/app/api/sitejson/_auth', () => ({
  requireOpsAccess: vi.fn(),
}));

describe('Ops API access control', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireOpsAccess).mockResolvedValue(null);
  });

  it('blocks unauthenticated access to ops dashboard', async () => {
    const denied = NextResponse.json({ ok: false }, { status: 401 });
    vi.mocked(requireOpsAccess).mockResolvedValueOnce(denied);

    const request = new Request('http://localhost:3000/api/sitejson/ops/dashboard');
    const response = await getOpsDashboard(request);

    expect(response).toBe(denied);
    expect(rateLimitedProxy).not.toHaveBeenCalled();
  });

  it('proxies ops dashboard after access check passes', async () => {
    const proxied = NextResponse.json({ ok: true }, { status: 200 });
    vi.mocked(rateLimitedProxy).mockResolvedValueOnce(proxied);

    const request = new Request('http://localhost:3000/api/sitejson/ops/dashboard');
    const response = await getOpsDashboard(request);

    expect(requireOpsAccess).toHaveBeenCalledWith(request);
    expect(rateLimitedProxy).toHaveBeenCalledWith(request, '/api/v1/ops/dashboard');
    expect(response).toBe(proxied);
  });

  it('proxies ops queues after access check passes', async () => {
    const proxied = NextResponse.json({ ok: true }, { status: 200 });
    vi.mocked(rateLimitedProxy).mockResolvedValueOnce(proxied);

    const request = new Request('http://localhost:3000/api/sitejson/ops/queues');
    const response = await getOpsQueues(request);

    expect(requireOpsAccess).toHaveBeenCalledWith(request);
    expect(rateLimitedProxy).toHaveBeenCalledWith(request, '/api/v1/ops/queues');
    expect(response).toBe(proxied);
  });

  it('proxies retry-dlq only after access check', async () => {
    const proxied = NextResponse.json({ ok: true }, { status: 200 });
    vi.mocked(rateLimitedProxy).mockResolvedValueOnce(proxied);

    const request = new Request('http://localhost:3000/api/sitejson/ops/retry-dlq', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ queue: 'browser', limit: 10 }),
    });

    const response = await postRetryDlq(request);

    expect(requireOpsAccess).toHaveBeenCalledWith(request);
    expect(rateLimitedProxy).toHaveBeenCalledWith(request, '/api/v1/ops/retry-dlq', {
      method: 'POST',
      body: '{"queue":"browser","limit":10}',
      headers: {
        'content-type': 'application/json',
      },
    });
    expect(response).toBe(proxied);
  });
});
