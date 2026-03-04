import { NextResponse } from 'next/server';
import {
  OAUTH_STATE_COOKIE_NAME,
  SESSION_COOKIE_NAME,
  SESSION_TTL_SECONDS,
  createSessionPayload,
  createSessionToken,
  isSecureCookie,
} from '@/lib/auth/session';

type GitHubTokenResponse = {
  access_token?: string;
  error?: string;
  error_description?: string;
};

type GitHubUserResponse = {
  id: number;
  login: string;
  name: string | null;
  avatar_url: string | null;
  email: string | null;
};

type GitHubEmailResponse = Array<{
  email: string;
  primary: boolean;
  verified: boolean;
}>;

const getBaseUrl = (request: Request): string => {
  const url = new URL(request.url);
  const forwardedProto = request.headers.get('x-forwarded-proto');
  const forwardedHost = request.headers.get('x-forwarded-host');
  const proto = forwardedProto ?? url.protocol.replace(':', '');
  const host = forwardedHost ?? request.headers.get('host') ?? url.host;
  return `${proto}://${host}`;
};

const getCookieValue = (cookieHeader: string, name: string): string | null => {
  for (const entry of cookieHeader.split(';')) {
    const [rawName, ...valueParts] = entry.trim().split('=');
    if (rawName !== name) continue;
    return decodeURIComponent(valueParts.join('='));
  }
  return null;
};

const redirectWithError = (request: Request, code: string) => {
  const target = new URL(`/?auth=${encodeURIComponent(code)}`, request.url);
  const response = NextResponse.redirect(target);
  response.cookies.set({
    name: OAUTH_STATE_COOKIE_NAME,
    value: '',
    path: '/',
    maxAge: 0,
  });
  return response;
};

const fetchGitHubToken = async (
  request: Request,
  code: string,
  state: string,
): Promise<string | null> => {
  const clientId = process.env.GITHUB_CLIENT_ID?.trim();
  const clientSecret = process.env.GITHUB_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) return null;

  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      state,
      redirect_uri: `${getBaseUrl(request)}/api/auth/github/callback`,
    }),
    cache: 'no-store',
  });

  if (!tokenRes.ok) return null;
  const tokenPayload = (await tokenRes.json()) as GitHubTokenResponse;
  return tokenPayload.access_token ?? null;
};

const fetchGitHubUser = async (accessToken: string): Promise<GitHubUserResponse | null> => {
  const authHeaders = {
    accept: 'application/vnd.github+json',
    authorization: `Bearer ${accessToken}`,
    'user-agent': 'sitejson-web-ssr-cf',
  };

  const userRes = await fetch('https://api.github.com/user', {
    headers: authHeaders,
    cache: 'no-store',
  });
  if (!userRes.ok) return null;

  const user = (await userRes.json()) as GitHubUserResponse;
  if (!user.id || !user.login) return null;
  if (user.email) return user;

  const emailRes = await fetch('https://api.github.com/user/emails', {
    headers: authHeaders,
    cache: 'no-store',
  });
  if (!emailRes.ok) return user;

  const emails = (await emailRes.json()) as GitHubEmailResponse;
  const primary = emails.find((item) => item.primary && item.verified) ?? emails.find((item) => item.verified);
  return {
    ...user,
    email: primary?.email ?? null,
  };
};

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const state = requestUrl.searchParams.get('state');
  const cookieState = getCookieValue(request.headers.get('cookie') ?? '', OAUTH_STATE_COOKIE_NAME);

  if (!code || !state || !cookieState || state !== cookieState) {
    return redirectWithError(request, 'github_state_mismatch');
  }

  const accessToken = await fetchGitHubToken(request, code, state);
  if (!accessToken) {
    return redirectWithError(request, 'github_token_exchange_failed');
  }

  const user = await fetchGitHubUser(accessToken);
  if (!user) {
    return redirectWithError(request, 'github_user_fetch_failed');
  }

  const sessionToken = await createSessionToken(
    createSessionPayload({
      id: String(user.id),
      login: user.login,
      name: user.name,
      avatarUrl: user.avatar_url,
      email: user.email,
    }),
  );

  const response = NextResponse.redirect(new URL('/dashboard', request.url));
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: sessionToken,
    httpOnly: true,
    secure: isSecureCookie(),
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  });
  response.cookies.set({
    name: OAUTH_STATE_COOKIE_NAME,
    value: '',
    path: '/',
    maxAge: 0,
  });

  return response;
}
