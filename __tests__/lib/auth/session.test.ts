import { describe, expect, it, vi } from 'vitest';
import {
  AUTH_PROVIDER_GITHUB,
  createSessionPayload,
  createSessionToken,
  getSessionFromApiKey,
  getSessionFromRequest,
  resolveSessionFromRequest,
  verifySessionToken,
} from '@/lib/auth/session';

const createToken = async () =>
  createSessionToken(
    createSessionPayload({
      id: 'u1',
      login: 'alice',
      name: 'Alice',
      email: 'alice@example.com',
      avatarUrl: 'https://avatars.githubusercontent.com/u/1',
    }),
  );

describe('auth session resolution', () => {
  it('resolves session from cookie', async () => {
    const token = await createToken();
    const request = new Request('https://sitejson.com/api/sitejson/sites/openai.com', {
      headers: {
        cookie: `sitejson_session=${encodeURIComponent(token)}`,
      },
    });

    const session = await getSessionFromRequest(request);

    expect(session?.login).toBe('alice');
    expect(session?.plan).toBe('free');
    expect(session?.authProvider).toBe(AUTH_PROVIDER_GITHUB);
  });

  it('resolves session from bearer api key', async () => {
    const token = await createToken();
    const request = new Request('https://sitejson.com/api/sitejson/sites/openai.com', {
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    const session = await getSessionFromApiKey(request);

    expect(session?.login).toBe('alice');
    expect(session?.sub).toBe('u1');
  });

  it('maps legacy github-plan tokens to free', async () => {
    const legacyToken = await createSessionToken({
      ...createSessionPayload({
        id: 'u3',
        login: 'legacy',
        name: 'Legacy',
        email: 'legacy@example.com',
        avatarUrl: 'https://avatars.githubusercontent.com/u/3',
      }),
      plan: 'github' as never,
    });
    const request = new Request('https://sitejson.com/api/sitejson/sites/openai.com', {
      headers: {
        authorization: `Bearer ${legacyToken}`,
      },
    });

    const session = await getSessionFromApiKey(request);

    expect(session?.plan).toBe('free');
    expect(session?.authProvider).toBe(AUTH_PROVIDER_GITHUB);
  });

  it('prefers cookie session before api key', async () => {
    const cookieToken = await createToken();
    const headerToken = await createSessionToken(
      createSessionPayload({
        id: 'u2',
        login: 'bob',
        name: 'Bob',
        email: 'bob@example.com',
        avatarUrl: 'https://avatars.githubusercontent.com/u/2',
      }),
    );

    const request = new Request('https://sitejson.com/api/sitejson/sites/openai.com', {
      headers: {
        cookie: `sitejson_session=${encodeURIComponent(cookieToken)}`,
        authorization: `Bearer ${headerToken}`,
      },
    });

    const session = await resolveSessionFromRequest(request);

    expect(session?.login).toBe('alice');
  });

  it('returns null for malformed token', async () => {
    const session = await verifySessionToken('not-a-valid-token-at-all');
    expect(session).toBeNull();
  });

  it('returns null for expired token', async () => {
    const payload = createSessionPayload({
      id: 'u1',
      login: 'alice',
      name: 'Alice',
      email: 'alice@example.com',
      avatarUrl: 'https://avatars.githubusercontent.com/u/1',
    });
    // Set expiry to the past
    payload.exp = Math.floor(Date.now() / 1000) - 3600;
    const token = await createSessionToken(payload);

    const session = await verifySessionToken(token);
    expect(session).toBeNull();
  });

  it('returns null for empty bearer token', async () => {
    const request = new Request('https://sitejson.com/api/sitejson/sites/openai.com', {
      headers: {
        authorization: 'Bearer ',
      },
    });

    const session = await getSessionFromApiKey(request);
    expect(session).toBeNull();
  });
});
