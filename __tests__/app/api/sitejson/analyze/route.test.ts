import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextResponse } from 'next/server';
import { POST } from '@/app/api/sitejson/analyze/route';
import { rateLimitedProxy } from '@/app/api/sitejson/_lib';

vi.mock('@/app/api/sitejson/_lib', () => ({
  rateLimitedProxy: vi.fn(),
}));

describe('POST /api/sitejson/analyze', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('proxies to backend analyze endpoint defined by API contract', async () => {
    const mockResponse = NextResponse.json({ ok: true }, { status: 202 });
    vi.mocked(rateLimitedProxy).mockResolvedValueOnce(mockResponse);

    const request = new Request('http://localhost:3000/api/sitejson/analyze', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ domain: 'example.com' }),
    });

    const response = await POST(request);

    expect(rateLimitedProxy).toHaveBeenCalledWith(request, '/api/v1/analyze', {
      method: 'POST',
      body: '{"domain":"example.com"}',
      headers: {
        'content-type': 'application/json',
      },
    });
    expect(response).toBe(mockResponse);
  });
});
