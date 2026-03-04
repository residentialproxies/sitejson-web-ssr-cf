import { rateLimitedProxy } from '../../_lib';

export const runtime = 'edge';

type RouteContext = {
  params: Promise<{
    jobId: string;
  }>;
};

export async function GET(request: Request, { params }: RouteContext) {
  const { jobId } = await params;
  return rateLimitedProxy(request, `/api/v1/jobs/${encodeURIComponent(jobId)}`);
}
