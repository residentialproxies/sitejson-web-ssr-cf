import { NextResponse } from 'next/server';
import {
  OAUTH_STATE_COOKIE_NAME,
  SESSION_COOKIE_NAME,
  isSecureCookie,
} from '@/lib/auth/session';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

function clearCookie(response: NextResponse, name: string) {
  response.cookies.set(name, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: isSecureCookie(),
    path: '/',
    maxAge: 0,
  });
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const returnToRaw = requestUrl.searchParams.get('returnTo');
  const returnTo = returnToRaw && returnToRaw.startsWith('/') ? returnToRaw : '/';
  const targetUrl = new URL(returnTo, request.url);
  const response = NextResponse.redirect(targetUrl);

  clearCookie(response, SESSION_COOKIE_NAME);
  clearCookie(response, OAUTH_STATE_COOKIE_NAME);

  return response;
}
