import { proxyToSitejson } from '../../../../_lib';

export const runtime = 'edge';

type RouteContext = {
  params: Promise<{
    type: string;
    slug: string;
  }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  const { type, slug } = await params;
  return proxyToSitejson(
    `/api/v1/directory/${encodeURIComponent(type)}/${encodeURIComponent(slug)}/stats`,
  );
}
