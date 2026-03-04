import { rateLimitedProxy } from '../../_lib';

export const runtime = 'edge';

export async function POST(request: Request) {
  const body = await request.text();

  return rateLimitedProxy(request, '/api/v1/ingest/domains', {
    method: 'POST',
    body,
    headers: {
      'content-type': 'application/json',
    },
  });
}
