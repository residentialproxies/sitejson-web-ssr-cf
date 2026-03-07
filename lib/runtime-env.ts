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

export const readRuntimeBinding = <T>(key: string): T | undefined => {
  const context = (globalThis as Record<PropertyKey, unknown>)[
    requestContextSymbol
  ] as CloudflareRequestContext | undefined;

  const value = context?.env?.[key];
  if (value == null) return undefined;

  return value as T;
};

export const readRuntimeEnv = (key: string): string | undefined => {
  const contextValue = readFromCloudflareContext(key);
  if (contextValue) {
    return contextValue;
  }

  const processValue = process.env[key];
  if (typeof processValue === 'string') {
    const trimmed = processValue.trim();
    if (trimmed) return trimmed;
  }
  return undefined;
};
