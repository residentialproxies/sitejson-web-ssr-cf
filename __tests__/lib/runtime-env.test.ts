import { afterEach, describe, expect, it } from 'vitest';
import { readRuntimeEnv } from '@/lib/runtime-env';

const requestContextSymbol = Symbol.for('__cloudflare-request-context__');

const clearRequestContext = () => {
  delete (globalThis as Record<PropertyKey, unknown>)[requestContextSymbol];
};

describe('readRuntimeEnv', () => {
  afterEach(() => {
    delete process.env.SITEJSON_API_KEY;
    clearRequestContext();
  });

  it('returns process env value when available', () => {
    process.env.SITEJSON_API_KEY = 'process-key';

    expect(readRuntimeEnv('SITEJSON_API_KEY')).toBe('process-key');
  });

  it('falls back to Cloudflare request context binding', () => {
    delete process.env.SITEJSON_API_KEY;
    (globalThis as Record<PropertyKey, unknown>)[requestContextSymbol] = {
      env: {
        SITEJSON_API_KEY: 'cf-key',
      },
    };

    expect(readRuntimeEnv('SITEJSON_API_KEY')).toBe('cf-key');
  });

  it('returns undefined when missing or blank', () => {
    process.env.SITEJSON_API_KEY = '   ';
    (globalThis as Record<PropertyKey, unknown>)[requestContextSymbol] = {
      env: {
        SITEJSON_API_KEY: '   ',
      },
    };

    expect(readRuntimeEnv('SITEJSON_API_KEY')).toBeUndefined();
  });
});
