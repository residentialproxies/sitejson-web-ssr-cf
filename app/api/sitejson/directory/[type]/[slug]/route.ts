import { rateLimitedProxy } from '../../../_lib';

export const runtime = 'edge';

type RouteContext = {
  params: Promise<{
    type: string;
    slug: string;
  }>;
};

export async function GET(request: Request, { params }: RouteContext) {
  const { type, slug } = await params;
  const url = new URL(request.url);
  const page = url.searchParams.get('page') ?? '1';
  const pageSize = url.searchParams.get('page_size') ?? '20';
  const sort = url.searchParams.get('sort');
  const minScore = url.searchParams.get('min_score');
  const hasTraffic = url.searchParams.get('has_traffic');

  let qs = `page=${encodeURIComponent(page)}&page_size=${encodeURIComponent(pageSize)}`;
  if (sort) qs += `&sort=${encodeURIComponent(sort)}`;
  if (minScore) qs += `&min_score=${encodeURIComponent(minScore)}`;
  if (hasTraffic) qs += `&has_traffic=${encodeURIComponent(hasTraffic)}`;

  return rateLimitedProxy(
    request,
    `/api/v1/directory/${encodeURIComponent(type)}/${encodeURIComponent(slug)}?${qs}`,
  );
}
