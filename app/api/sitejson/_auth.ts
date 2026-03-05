import { NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/session';

const jsonError = (status: number, code: string, message: string) =>
  NextResponse.json(
    {
      ok: false,
      error: {
        code,
        message,
      },
    },
    {
      status,
      headers: {
        'cache-control': 'no-store',
      },
    },
  );

const getAllowedOpsUsers = (): string[] => {
  const raw = process.env.SITEJSON_INTERNAL_OPS_USERS ?? '';
  return raw
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
};

const getBearerToken = (request: Request): string | null => {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return null;

  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
};

export const requireOpsAccess = async (request: Request): Promise<NextResponse | null> => {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return jsonError(401, 'UNAUTHORIZED', 'Sign in is required for this endpoint.');
  }

  const allowedUsers = getAllowedOpsUsers();
  if (allowedUsers.length > 0 && !allowedUsers.includes(session.login.toLowerCase())) {
    return jsonError(403, 'FORBIDDEN', 'Your account is not allowed to access this endpoint.');
  }

  return null;
};

export const requireReadinessAccess = async (request: Request): Promise<NextResponse | null> => {
  const configuredToken = process.env.SITEJSON_READY_CHECK_TOKEN?.trim();

  if (configuredToken) {
    const headerToken =
      request.headers.get('x-sitejson-ready-token')?.trim() ??
      getBearerToken(request);

    if (!headerToken || headerToken !== configuredToken) {
      return jsonError(401, 'UNAUTHORIZED', 'Valid readiness token is required.');
    }

    return null;
  }

  return requireOpsAccess(request);
};
