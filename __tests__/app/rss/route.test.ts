import { describe, expect, it } from 'vitest';
import { GET } from '@/app/rss.xml/route';

describe('GET /rss.xml', () => {
  it('returns a valid RSS response', async () => {
    const response = await GET();
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('application/rss+xml');
    expect(body).toContain('<rss version="2.0">');
    expect(body).toContain('<channel>');
    expect(body).toContain('<title>SiteJSON Updates</title>');
  });
});
