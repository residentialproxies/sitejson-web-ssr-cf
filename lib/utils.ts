import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Normalize free-form directory labels into URL-safe slugs.
 * Examples: "Next.js" -> "nextjs", "Cloud & AI" -> "cloud-and-ai".
 */
export function normalizeDirectorySlug(value: string): string {
  const normalized = value
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[.'’`]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

  return normalized;
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

export function formatDurationHMS(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.round(seconds % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function formatBigNumber(num: number): string {
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(2) + 'B';
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(2) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(2) + 'K';
  return num.toString();
}

export function getRankBadgeColor(rank: number) {
  if (rank <= 100) return "bg-yellow-100 text-yellow-800 border-yellow-200";
  if (rank <= 1000) return "bg-slate-100 text-slate-800 border-slate-200";
  if (rank <= 100000) return "bg-blue-50 text-blue-700 border-blue-200";
  return "bg-gray-50 text-gray-600 border-gray-200";
}

export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
}

// Image optimization utilities
export const IMAGE_SIZES = {
  thumbnail: { width: 120, height: 75 },
  small: { width: 320, height: 200 },
  medium: { width: 640, height: 400 },
  large: { width: 1280, height: 800 },
  full: { width: 1920, height: 1200 },
} as const;

export type ImageSize = keyof typeof IMAGE_SIZES;

/**
 * Generate optimized screenshot URL using Cloudflare Images or fallback
 */
export function getScreenshotUrl(
  domain: string,
  size: ImageSize = 'large',
  options?: {
    format?: 'webp' | 'avif' | 'jpeg';
    quality?: number;
  }
): string {
  const { width, height } = IMAGE_SIZES[size];
  const format = options?.format ?? 'webp';
  const quality = options?.quality ?? 85;

  // Try Cloudflare Images first (if configured)
  const cfImagesAccount = process.env.NEXT_PUBLIC_CF_IMAGES_ACCOUNT;
  if (cfImagesAccount) {
    const variant = size === 'thumbnail' ? 'thumbnail' : size === 'full' ? 'full' : 'public';
    return `https://imagedelivery.net/${cfImagesAccount}/${domain}/${variant}`;
  }

  // Fallback to thum.io with optimization parameters
  return `https://image.thum.io/get/width/${width}/crop/${height}/format/${format}/quality/${quality}/https://${domain}`;
}

/**
 * Generate favicon URL with fallback
 */
export function getFaviconUrl(domain: string, size: 16 | 32 | 64 = 32): string {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=${size}`;
}

/**
 * Generate blur placeholder for images
 */
export function generateBlurPlaceholder(width: number, height: number): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}"><rect fill="#f3f4f6" width="100%" height="100%"/></svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Throttle function for performance optimization
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Caching utilities
export function memoize<T extends (...args: unknown[]) => unknown>(
  fn: T,
  keyGenerator?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();
  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    const result = fn(...args) as ReturnType<T>;
    cache.set(key, result);
    return result;
  }) as T;
}

/**
 * Create a cached fetch with TTL
 */
export function createCachedFetch<T>(
  fetcher: () => Promise<T>,
  ttlMs: number = 60000
): () => Promise<T> {
  let cached: T | null = null;
  let lastFetch = 0;

  return async () => {
    const now = Date.now();
    if (!cached || now - lastFetch > ttlMs) {
      cached = await fetcher();
      lastFetch = now;
    }
    return cached;
  };
}
