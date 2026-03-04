import { NextResponse } from 'next/server';
import {
  OAUTH_STATE_COOKIE_NAME,
  OAUTH_STATE_TTL_SECONDS,
  generateOAuthState,
  isSecureCookie,
} from '@/lib/auth/session';

const getBaseUrl = (request: Request): string => {
  const configured = process.env.PUBLIC_SITE_BASE_URL?.trim();
  if (configured) {
    return configured.replace(/\/+$/, '');
  }

  return new URL(request.url).origin;
};

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export async function GET(request: Request) {
  const clientId = process.env.GITHUB_CLIENT_ID?.trim();
  if (!clientId) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'GITHUB_OAUTH_NOT_CONFIGURED',
          message: 'Missing GITHUB_CLIENT_ID.',
        },
      },
      { status: 500 },
    );
  }

  const state = generateOAuthState();
  const redirectUri = `${getBaseUrl(request)}/api/auth/github/callback`;

  const authorizeUrl = new URL('https://github.com/login/oauth/authorize');
  authorizeUrl.searchParams.set('client_id', clientId);
  authorizeUrl.searchParams.set('redirect_uri', redirectUri);
  authorizeUrl.searchParams.set('scope', 'read:user user:email');
  authorizeUrl.searchParams.set('state', state);

  const response = NextResponse.redirect(authorizeUrl);
  response.cookies.set({
    name: OAUTH_STATE_COOKIE_NAME,
    value: state,
    httpOnly: true,
    secure: isSecureCookie(),
    sameSite: 'lax',
    path: '/',
    maxAge: OAUTH_STATE_TTL_SECONDS,
  });

  return response;
}
