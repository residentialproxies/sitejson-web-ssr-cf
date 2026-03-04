import { rateLimitedProxy } from '../../../../_lib';

export const runtime = 'edge';

type RouteContext = {
  params: Promise<{ domain: string; provider: string }>;
};

export async function GET(request: Request, { params }: RouteContext) {
  const { domain, provider } = await params;
  return rateLimitedProxy(
    request,
    `/api/v1/sites/${encodeURIComponent(domain)}/providers/${encodeURIComponent(provider)}`,
  );
}
