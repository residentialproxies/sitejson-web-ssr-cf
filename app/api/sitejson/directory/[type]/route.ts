import { proxyToSitejson } from '../../_lib';

export const runtime = 'edge';

type RouteContext = {
  params: Promise<{
    type: string;
  }>;
};

export async function GET(request: Request, { params }: RouteContext) {
  const { type } = await params;
  const url = new URL(request.url);
  const limit = url.searchParams.get('limit') ?? '50';

  return proxyToSitejson(
    `/api/v1/directory/${encodeURIComponent(type)}?limit=${encodeURIComponent(limit)}`,
  );
}
