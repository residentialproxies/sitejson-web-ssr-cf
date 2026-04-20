import { readRuntimeEnv } from '@/lib/runtime-env';

const LEGACY_SCREENSHOT_HOSTS = new Set(['cdn.sitejson.com']);

const normalizeBaseUrl = (value: string): string => value.replace(/\/+$/, '');

const domainToKey = (domain: string): string => domain.toLowerCase().replace(/[^a-z0-9]/g, '_');

export const buildStoredScreenshotUrl = (domain: string, baseUrl: string): string => {
  const normalizedBase = normalizeBaseUrl(baseUrl);
  return `${normalizedBase}/snapshots/${domainToKey(domain)}.webp`;
};

const getConfiguredScreenshotBaseUrl = (): string | undefined => {
  return (
    readRuntimeEnv('SITEJSON_SCREENSHOT_BASE_URL')
    ?? readRuntimeEnv('NEXT_PUBLIC_SITEJSON_SCREENSHOT_BASE_URL')
  );
};

const isLegacyScreenshotUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    return LEGACY_SCREENSHOT_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
};

export const resolveStoredScreenshotUrl = (domain: string, upstreamUrl?: string): string | undefined => {
  const configuredBaseUrl = getConfiguredScreenshotBaseUrl();
  if (configuredBaseUrl) {
    return buildStoredScreenshotUrl(domain, configuredBaseUrl);
  }

  if (!upstreamUrl) return undefined;
  if (isLegacyScreenshotUrl(upstreamUrl)) return undefined;
  return upstreamUrl;
};

