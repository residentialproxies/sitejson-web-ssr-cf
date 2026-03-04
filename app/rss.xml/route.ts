const BASE_URL = process.env.PUBLIC_SITE_BASE_URL ?? 'https://sitejson.com';

const escapeXml = (value: string): string => (
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll('\'', '&apos;')
);

const buildAbsoluteUrl = (path: string): string => `${BASE_URL}${path}`;

type FeedItem = {
  title: string;
  description: string;
  path: string;
};

const FEED_ITEMS: FeedItem[] = [
  {
    title: 'SiteJSON — Website Intelligence Platform',
    description: 'Analyze any domain for SEO, traffic, technology stack, and trust signals.',
    path: '/',
  },
  {
    title: 'Technology Directory',
    description: 'Discover top websites by technology stack.',
    path: '/directory/category/technology',
  },
  {
    title: 'Topic Directory',
    description: 'Explore websites by industry and topic.',
    path: '/directory/topic/finance',
  },
];

export const runtime = 'edge';

export async function GET() {
  const publishedAt = new Date().toUTCString();
  const feedItems = FEED_ITEMS.map((item) => (
    `<item>
      <title>${escapeXml(item.title)}</title>
      <description>${escapeXml(item.description)}</description>
      <link>${escapeXml(buildAbsoluteUrl(item.path))}</link>
      <guid isPermaLink="true">${escapeXml(buildAbsoluteUrl(item.path))}</guid>
      <pubDate>${publishedAt}</pubDate>
    </item>`
  )).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>SiteJSON Updates</title>
    <description>Website intelligence updates, directories, and analysis resources.</description>
    <link>${escapeXml(BASE_URL)}</link>
    <language>en-us</language>
    <lastBuildDate>${publishedAt}</lastBuildDate>
    ${feedItems}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'content-type': 'application/rss+xml; charset=utf-8',
      'cache-control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
