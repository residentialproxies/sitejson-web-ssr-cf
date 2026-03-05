import { afterEach, describe, expect, it } from 'vitest';
import robots from '@/app/robots';

describe('robots route', () => {
  const originalBaseUrl = process.env.PUBLIC_SITE_BASE_URL;

  afterEach(() => {
    if (originalBaseUrl == null) {
      delete process.env.PUBLIC_SITE_BASE_URL;
    } else {
      process.env.PUBLIC_SITE_BASE_URL = originalBaseUrl;
    }
  });

  it('returns strict crawler policy for internal routes', () => {
    const result = robots();

    expect(result.rules).toEqual([
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/auth/', '/api/sitejson/', '/site/', '/playground/'],
      },
    ]);
    expect(result.sitemap).toBe('https://sitejson.com/sitemap.xml');
    expect(result.host).toBe('https://sitejson.com');
  });

  it('normalizes base URL trailing slash for host and sitemap', () => {
    process.env.PUBLIC_SITE_BASE_URL = 'https://preview.sitejson.com/';

    const result = robots();

    expect(result.host).toBe('https://preview.sitejson.com');
    expect(result.sitemap).toBe('https://preview.sitejson.com/sitemap.xml');
  });
});
