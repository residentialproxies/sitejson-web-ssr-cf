const encoder = new TextEncoder();
const decoder = new TextDecoder();

export const SESSION_COOKIE_NAME = 'sitejson_session';
export const OAUTH_STATE_COOKIE_NAME = 'sitejson_oauth_state';
export const PLAN_COOKIE_NAME = 'sitejson_plan';
export const USER_COOKIE_NAME = 'sitejson_user';
export const LOGIN_COOKIE_NAME = 'sitejson_login';

export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days
export const OAUTH_STATE_TTL_SECONDS = 60 * 10; // 10 minutes
export const AUTH_PROVIDER_GITHUB = 'github';
export const FREE_STARTER_CREDITS = 200;
export const FREE_RATE_LIMIT_RPM = 10;
export const PRO_MONTHLY_QUOTA = 1000;
export const PRO_RATE_LIMIT_RPM = 100;
export const BILLING_MODE_MANUAL = 'manual';

export type SessionPlan = 'free' | 'pro';
export type SessionAuthProvider = typeof AUTH_PROVIDER_GITHUB;

export type SessionUser = {
  id: string;
  login: string;
  name: string | null;
  avatarUrl: string | null;
  email: string | null;
};

export type SessionPayload = {
  sub: string;
  plan: SessionPlan;
  authProvider: SessionAuthProvider;
  login: string;
  name: string | null;
  email: string | null;
  avatarUrl: string | null;
  user: SessionUser;
  iat: number;
  exp: number;
};

const toBase64Url = (bytes: Uint8Array): string => {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
};

const fromBase64Url = (value: string): Uint8Array => {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = `${base64}${'='.repeat((4 - (base64.length % 4)) % 4)}`;
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

const timingSafeEqual = (a: string, b: string): boolean => {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i += 1) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
};

export const getSessionSecret = (): string => {
  const configured =
    process.env.AUTH_SESSION_SECRET ??
    process.env.SITEJSON_SESSION_SECRET ??
    process.env.NEXTAUTH_SECRET ??
    '';

  if (configured.trim()) return configured.trim();
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Missing AUTH_SESSION_SECRET for session signing in production.');
  }

  return 'sitejson-dev-session-secret-change-me';
};

export const isSecureCookie = (): boolean => process.env.NODE_ENV === 'production';

const signValue = async (value: string): Promise<string> => {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(getSessionSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(value));
  return toBase64Url(new Uint8Array(signature));
};

export const generateOAuthState = (): string => {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return toBase64Url(bytes);
};

export const createSessionPayload = (user: SessionUser): SessionPayload => {
  const iat = Math.floor(Date.now() / 1000);
  return {
    sub: user.id,
    plan: 'free',
    authProvider: AUTH_PROVIDER_GITHUB,
    login: user.login,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    user,
    iat,
    exp: iat + SESSION_TTL_SECONDS,
  };
};

export const createSessionToken = async (payload: SessionPayload): Promise<string> => {
  const body = toBase64Url(encoder.encode(JSON.stringify(payload)));
  const signature = await signValue(body);
  return `${body}.${signature}`;
};

export const verifySessionToken = async (token: string | null | undefined): Promise<SessionPayload | null> => {
  if (!token) return null;

  const [body, signature] = token.split('.');
  if (!body || !signature) return null;

  const expected = await signValue(body);
  if (!timingSafeEqual(signature, expected)) return null;

  try {
    const parsed = JSON.parse(decoder.decode(fromBase64Url(body))) as Partial<SessionPayload>;
    const now = Math.floor(Date.now() / 1000);
    const legacyPlan = (parsed as { plan?: string }).plan;
    const parsedPlan = legacyPlan === 'pro' ? 'pro' : legacyPlan === 'free' || legacyPlan === 'github' ? 'free' : null;
    const login = parsed.login ?? parsed.user?.login;
    const name = parsed.name ?? parsed.user?.name ?? null;
    const email = parsed.email ?? parsed.user?.email ?? null;
    const avatarUrl = parsed.avatarUrl ?? parsed.user?.avatarUrl ?? null;
    const sub = parsed.sub ?? parsed.user?.id;
    const authProvider = parsed.authProvider === AUTH_PROVIDER_GITHUB || legacyPlan === 'github'
      ? AUTH_PROVIDER_GITHUB
      : parsed.authProvider ?? AUTH_PROVIDER_GITHUB;

    if (!sub || !login) return null;
    if (!parsedPlan) return null;
    if (!parsed.exp || parsed.exp <= now) return null;

    return {
      sub,
      plan: parsedPlan,
      authProvider,
      login,
      name,
      email,
      avatarUrl,
      user: {
        id: sub,
        login,
        name,
        email,
        avatarUrl,
      },
      iat: parsed.iat ?? now,
      exp: parsed.exp,
    };
  } catch {
    return null;
  }
};

const getCookieValue = (cookieHeader: string, name: string): string | null => {
  for (const entry of cookieHeader.split(';')) {
    const [rawName, ...valueParts] = entry.trim().split('=');
    if (rawName !== name) continue;
    return decodeURIComponent(valueParts.join('='));
  }
  return null;
};

const getApiKeyValue = (request: Request): string | null => {
  const authorization = request.headers.get('authorization');
  if (authorization) {
    const match = authorization.match(/^Bearer\s+(.+)$/i);
    if (match?.[1]?.trim()) {
      return match[1].trim();
    }
  }

  const apiKey = request.headers.get('x-api-key')?.trim();
  return apiKey || null;
};

export const getSessionFromRequest = async (request: Request): Promise<SessionPayload | null> => {
  const token = getCookieValue(request.headers.get('cookie') ?? '', SESSION_COOKIE_NAME);
  return verifySessionToken(token);
};

export const getSessionFromApiKey = async (request: Request): Promise<SessionPayload | null> => {
  const token = getApiKeyValue(request);
  return verifySessionToken(token);
};

export const resolveSessionFromRequest = async (request: Request): Promise<SessionPayload | null> => {
  const cookieSession = await getSessionFromRequest(request);
  if (cookieSession) return cookieSession;
  return getSessionFromApiKey(request);
};
