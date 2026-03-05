type CloudflareRequestContext = {
  env?: Record<string, unknown>;
};

const requestContextSymbol = Symbol.for('__cloudflare-request-context__');

const readFromCloudflareContext = (key: string): string | undefined => {
  const context = (globalThis as Record<PropertyKey, unknown>)[
    requestContextSymbol
  ] as CloudflareRequestContext | undefined;
  const value = context?.env?.[key];
  if (typeof value !== 'string') return undefined;

  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
};

export const readRuntimeEnv = (key: string): string | undefined => {
  const processValue = process.env[key];
  if (typeof processValue === 'string') {
    const trimmed = processValue.trim();
    if (trimmed) return trimmed;
  }

  return readFromCloudflareContext(key);
};
