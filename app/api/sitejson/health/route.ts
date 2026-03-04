import { rateLimitedProxy } from '../_lib';

export const runtime = 'edge';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const check = url.searchParams.get('check');

  const backendPath = check === 'ready' ? '/api/v1/readyz' : '/api/v1/healthz';
  return rateLimitedProxy(request, backendPath);
}
