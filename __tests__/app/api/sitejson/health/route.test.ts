import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextResponse } from 'next/server';
import { GET } from '@/app/api/sitejson/health/route';
import { rateLimitedProxy } from '@/app/api/sitejson/_lib';
import { requireReadinessAccess } from '@/app/api/sitejson/_auth';

vi.mock('@/app/api/sitejson/_lib', () => ({
  rateLimitedProxy: vi.fn(),
}));

vi.mock('@/app/api/sitejson/_auth', () => ({
  requireReadinessAccess: vi.fn(),
}));

describe('GET /api/sitejson/health', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireReadinessAccess).mockResolvedValue(null);
  });

  it('allows healthz without readiness guard', async () => {
    const proxied = NextResponse.json({ ok: true }, { status: 200 });
    vi.mocked(rateLimitedProxy).mockResolvedValueOnce(proxied);

    const request = new Request('http://localhost:3000/api/sitejson/health');
    const response = await GET(request);

    expect(requireReadinessAccess).not.toHaveBeenCalled();
    expect(rateLimitedProxy).toHaveBeenCalledWith(request, '/api/v1/healthz');
    expect(response).toBe(proxied);
  });

  it('blocks readiness check when token/auth validation fails', async () => {
    const denied = NextResponse.json({ ok: false }, { status: 401 });
    vi.mocked(requireReadinessAccess).mockResolvedValueOnce(denied);

    const request = new Request('http://localhost:3000/api/sitejson/health?check=ready');
    const response = await GET(request);

    expect(requireReadinessAccess).toHaveBeenCalledWith(request);
    expect(rateLimitedProxy).not.toHaveBeenCalled();
    expect(response).toBe(denied);
  });

  it('proxies readiness check when guard passes', async () => {
    const proxied = NextResponse.json({ ok: true }, { status: 200 });
    vi.mocked(rateLimitedProxy).mockResolvedValueOnce(proxied);

    const request = new Request('http://localhost:3000/api/sitejson/health?check=ready');
    const response = await GET(request);

    expect(requireReadinessAccess).toHaveBeenCalledWith(request);
    expect(rateLimitedProxy).toHaveBeenCalledWith(request, '/api/v1/readyz');
    expect(response).toBe(proxied);
  });
});
