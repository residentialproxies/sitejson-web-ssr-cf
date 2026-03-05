import { rateLimitedProxy } from '../../_lib';
import { requireOpsAccess } from '../../_auth';

export const runtime = 'edge';

export async function POST(request: Request) {
  const denied = await requireOpsAccess(request);
  if (denied) return denied;

  const body = await request.text();

  return rateLimitedProxy(request, '/api/v1/ops/retry-dlq', {
    method: 'POST',
    body,
    headers: {
      'content-type': 'application/json',
    },
  });
}
