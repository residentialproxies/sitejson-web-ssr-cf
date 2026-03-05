import { rateLimitedProxy } from '../_lib';
import { requireReadinessAccess } from '../_auth';

export const runtime = 'edge';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const check = url.searchParams.get('check');

  if (check === 'ready') {
    const denied = await requireReadinessAccess(request);
    if (denied) return denied;
  }

  const backendPath = check === 'ready' ? '/api/v1/readyz' : '/api/v1/healthz';
  return rateLimitedProxy(request, backendPath);
}
