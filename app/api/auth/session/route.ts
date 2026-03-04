import { NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export async function GET(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({
      ok: true,
      authenticated: false,
      plan: 'anonymous',
    });
  }

  return NextResponse.json({
    ok: true,
    authenticated: true,
    plan: session.plan,
    user: {
      id: session.sub,
      login: session.login,
      name: session.name ?? null,
      email: session.email ?? null,
      avatarUrl: session.avatarUrl ?? null,
    },
  });
}
