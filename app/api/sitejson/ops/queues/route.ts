import { rateLimitedProxy } from '../../_lib';
import { requireOpsAccess } from '../../_auth';

export const runtime = 'edge';

export async function GET(request: Request) {
  const denied = await requireOpsAccess(request);
  if (denied) return denied;

  return rateLimitedProxy(request, '/api/v1/ops/queues');
}
