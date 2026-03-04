import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextResponse } from 'next/server';
import { GET } from '@/app/api/sitejson/sites/[domain]/route';
import { rateLimitedProxy } from '@/app/api/sitejson/_lib';

// Mock the rateLimitedProxy function
vi.mock('@/app/api/sitejson/_lib', () => ({
  rateLimitedProxy: vi.fn(),
}));

describe('GET /api/sitejson/sites/[domain]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call proxyToSitejson with encoded domain', async () => {
    const mockResponse = NextResponse.json({ ok: true }, { status: 200 });

    vi.mocked(rateLimitedProxy).mockResolvedValueOnce(mockResponse);

    const request = new Request('http://localhost:3000/api/sitejson/sites/example.com');
    const params = Promise.resolve({ domain: 'example.com' });

    const response = await GET(request, { params });

    expect(rateLimitedProxy).toHaveBeenCalledWith(request, '/api/v1/sites/example.com');
    expect(response).toBe(mockResponse);
  });

  it('should handle domains with special characters', async () => {
    const mockResponse = NextResponse.json({ ok: true }, { status: 200 });

    vi.mocked(rateLimitedProxy).mockResolvedValueOnce(mockResponse);

    const request = new Request('http://localhost:3000/api/sitejson/sites/example.com%2Fpath');
    const params = Promise.resolve({ domain: 'example.com/path' });

    await GET(request, { params });

    expect(rateLimitedProxy).toHaveBeenCalledWith(request, '/api/v1/sites/example.com%2Fpath');
  });

  it('should handle subdomains', async () => {
    const mockResponse = NextResponse.json({ ok: true }, { status: 200 });

    vi.mocked(rateLimitedProxy).mockResolvedValueOnce(mockResponse);

    const request = new Request('http://localhost:3000/api/sitejson/sites/sub.example.com');
    const params = Promise.resolve({ domain: 'sub.example.com' });

    await GET(request, { params });

    expect(rateLimitedProxy).toHaveBeenCalledWith(request, '/api/v1/sites/sub.example.com');
  });

  it('should handle proxy errors', async () => {
    const mockErrorResponse = NextResponse.json(
      { ok: false, error: { code: 'UPSTREAM_ERROR' } },
      { status: 502 }
    );

    vi.mocked(rateLimitedProxy).mockResolvedValueOnce(mockErrorResponse);

    const request = new Request('http://localhost:3000/api/sitejson/sites/error.com');
    const params = Promise.resolve({ domain: 'error.com' });

    const response = await GET(request, { params });

    expect(response.status).toBe(502);
    const body = await response.json();
    expect(body.ok).toBe(false);
  });
});
