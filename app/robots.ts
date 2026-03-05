import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const base = (process.env.PUBLIC_SITE_BASE_URL ?? 'https://sitejson.com').replace(/\/+$/, '');
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/auth/', '/api/sitejson/', '/site/', '/playground/'],
      },
    ],
    host: base,
    sitemap: `${base}/sitemap.xml`,
  };
}
