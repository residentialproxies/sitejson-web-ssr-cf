import { proxyToSitejson } from '../_lib';

export const runtime = 'edge';

export async function GET() {
  return proxyToSitejson('/api/v1/insights');
}
