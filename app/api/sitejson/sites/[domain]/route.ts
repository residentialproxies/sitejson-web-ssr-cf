import { rateLimitedProxy } from '../../_lib';

export const runtime = 'edge';

type RouteContext = {
  params: Promise<{
    domain: string;
  }>;
};

export async function GET(request: Request, { params }: RouteContext) {
  const { domain } = await params;
  return rateLimitedProxy(request, `/api/v1/sites/${encodeURIComponent(domain)}`);
}
