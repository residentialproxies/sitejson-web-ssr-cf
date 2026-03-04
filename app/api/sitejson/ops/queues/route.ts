import { rateLimitedProxy } from '../../_lib';

export const runtime = 'edge';

export async function GET(request: Request) {
  return rateLimitedProxy(request, '/api/v1/ops/queues');
}
