import '@testing-library/jest-dom';
import { vi, afterEach } from 'vitest';

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
    getAll: vi.fn(),
    has: vi.fn(),
    entries: vi.fn(),
    keys: vi.fn(),
    values: vi.fn(),
    toString: vi.fn(),
    forEach: vi.fn(),
  }),
  usePathname: () => '/',
  redirect: vi.fn(),
  permanentRedirect: vi.fn(),
}));

// Mock Next.js headers
vi.mock('next/headers', () => ({
  headers: () => new Headers(),
  cookies: () => ({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
    has: vi.fn(),
    getAll: vi.fn(),
  }),
  draftMode: () => ({
    isEnabled: false,
    enable: vi.fn(),
    disable: vi.fn(),
  }),
}));

// Mock environment variables
process.env.NEXT_PUBLIC_SITEJSON_API_BASE_URL = 'http://localhost:8787';
process.env.SITEJSON_API_KEY = 'test-api-key';
process.env.PUBLIC_SITE_BASE_URL = 'https://sitejson.com';

// Cleanup after each test
afterEach(() => {
  vi.clearAllMocks();
});
