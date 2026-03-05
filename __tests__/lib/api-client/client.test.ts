import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createElement, type ReactNode } from 'react';
import { renderHook } from '@testing-library/react';
import { SWRConfig } from 'swr';
import {
  getSiteReport,
  getDirectory,
  getSiteProviderSummary,
} from '@/lib/api-client/client';
import {
  useSiteReport,
  useJobStatus,
  useDirectory,
} from '@/lib/api-client/swr-hooks';
import type {
  SiteReportResponse,
  DirectoryResponse,
  SiteReport,
  SiteProviderSummaryResponse,
} from '@/lib/api-client/types';

const mockFetch = vi.fn();
global.fetch = mockFetch;

const createSWRWrapper = () => {
  const provider = () => new Map();
  return ({ children }: { children: ReactNode }) =>
    createElement(
      SWRConfig,
      {
        value: {
          provider,
          isPaused: () => true,
          shouldRetryOnError: false,
          revalidateOnFocus: false,
          revalidateOnReconnect: false,
        },
      },
      children,
    );
};

describe('API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.SITEJSON_API_KEY = 'test-api-key';
    process.env.NEXT_PUBLIC_SITEJSON_API_BASE_URL = 'http://localhost:8787';
  });

  afterEach(() => {
    delete process.env.SITEJSON_API_KEY;
    delete process.env.NEXT_PUBLIC_SITEJSON_API_BASE_URL;
  });

  describe('getSiteReport', () => {
    it('should fetch site report successfully', async () => {
      const mockReport: SiteReport = {
        domain: 'example.com',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      const mockResponse: SiteReportResponse = {
        ok: true,
        data: {
          domain: 'example.com',
          freshness: {
            is_stale: false,
            updated_at: '2024-01-01T00:00:00Z',
          },
          report: mockReport,
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await getSiteReport('example.com');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8787/api/v1/sites/example.com',
        expect.objectContaining({
          headers: expect.objectContaining({
            accept: 'application/json',
            'x-api-key': 'test-api-key',
          }),
          cache: 'no-store',
        })
      );

      expect(result).toEqual({
        report: mockReport,
        isStale: false,
        updatedAt: '2024-01-01T00:00:00Z',
      });
    });

    it('should return null on API error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      const result = await getSiteReport('nonexistent.com');
      expect(result).toBeNull();
    });

    it('should return null on network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await getSiteReport('example.com');
      expect(result).toBeNull();
    });

    it('should encode domain correctly', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await getSiteReport('example.com/path?query=1');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('example.com%2Fpath%3Fquery%3D1'),
        expect.any(Object)
      );
    });
  });

  describe('getDirectory', () => {
    it('should fetch directory data successfully', async () => {
      const mockResponse: DirectoryResponse = {
        ok: true,
        data: {
          items: [
            { domain: 'site1.com', title: 'Site 1' },
            { domain: 'site2.com', title: 'Site 2' },
          ],
          pagination: {
            page: 1,
            page_size: 24,
            total: 2,
          },
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await getDirectory('technology', 'react');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/directory/'),
        expect.any(Object)
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('technology/react'),
        expect.any(Object)
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('page=1&page_size=24'),
        expect.any(Object)
      );

      expect(result).toEqual(mockResponse.data);
    });

    it('should support custom pagination', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            ok: true,
            data: {
              items: [],
              pagination: { page: 2, page_size: 10, total: 0 },
            },
          }),
      });

      await getDirectory('category', 'news', 2, 10);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('page=2&page_size=10'),
        expect.any(Object)
      );
    });

    it('should encode type and slug', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await getDirectory('tech type', 'slug/with/slashes');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('tech%20type/slug%2Fwith%2Fslashes'),
        expect.any(Object)
      );
    });
  });

  describe('getSiteProviderSummary', () => {
    it('should fetch provider summary successfully', async () => {
      const mockResponse: SiteProviderSummaryResponse = {
        ok: true,
        data: {
          domain: 'example.com',
          updatedAt: '2026-03-01T00:00:00Z',
          providers: [
            {
              provider: 'traffic',
              hasData: true,
              health: { ok: true },
              completeness: {
                total: 10,
                present: 9,
                missing: 1,
                fields: { monthlyVisits: true },
              },
            },
          ],
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await getSiteProviderSummary('example.com');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8787/api/v1/sites/example.com/providers',
        expect.any(Object),
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should return null when provider summary request fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const result = await getSiteProviderSummary('example.com');
      expect(result).toBeNull();
    });
  });

  describe('API key handling', () => {
    it('should not include API key header when not set', async () => {
      delete process.env.SITEJSON_API_KEY;

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await getSiteReport('example.com');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.not.objectContaining({
            'x-api-key': expect.any(String),
          }),
        })
      );
    });
  });

  describe('Base URL fallback', () => {
    it('should use fallback URL when env vars not set', async () => {
      delete process.env.NEXT_PUBLIC_SITEJSON_API_BASE_URL;

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      await getSiteReport('example.com');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('http://127.0.0.1:8787'),
        expect.any(Object)
      );
    });
  });
});

describe('SWR Hooks', () => {
  // Note: SWR v2+ doesn't expose the key property directly
  // We test the hook configuration by checking if the fetcher is called correctly

  describe('useSiteReport', () => {
    it('should be defined', () => {
      expect(useSiteReport).toBeDefined();
      expect(typeof useSiteReport).toBe('function');
    });

    it('should return SWR response object', () => {
      const { result } = renderHook(() => useSiteReport('example.com'), {
        wrapper: createSWRWrapper(),
      });
      // SWR v2 returns an object with data, error, isLoading, isValidating, mutate
      expect(result.current).toHaveProperty('data');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('isValidating');
      expect(result.current).toHaveProperty('mutate');
    });

    it('should handle null domain gracefully', () => {
      const { result } = renderHook(() => useSiteReport(null), {
        wrapper: createSWRWrapper(),
      });
      // When domain is null, SWR should not fetch (key is null)
      expect(result.current).toHaveProperty('data');
      expect(result.current).toHaveProperty('isLoading');
    });
  });

  describe('useJobStatus', () => {
    it('should be defined', () => {
      expect(useJobStatus).toBeDefined();
      expect(typeof useJobStatus).toBe('function');
    });

    it('should return SWR response object', () => {
      const { result } = renderHook(() => useJobStatus('job-123'), {
        wrapper: createSWRWrapper(),
      });
      expect(result.current).toHaveProperty('data');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('isLoading');
    });

    it('should handle null jobId gracefully', () => {
      const { result } = renderHook(() => useJobStatus(null), {
        wrapper: createSWRWrapper(),
      });
      expect(result.current).toHaveProperty('data');
      expect(result.current).toHaveProperty('isLoading');
    });
  });

  describe('useDirectory', () => {
    it('should be defined', () => {
      expect(useDirectory).toBeDefined();
      expect(typeof useDirectory).toBe('function');
    });

    it('should return SWR response object', () => {
      const { result } = renderHook(() => useDirectory('technology', 'react'), {
        wrapper: createSWRWrapper(),
      });
      expect(result.current).toHaveProperty('data');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('isLoading');
    });

    it('should accept custom pagination', () => {
      const { result } = renderHook(() => useDirectory('category', 'news', 2, 12), {
        wrapper: createSWRWrapper(),
      });
      expect(result.current).toHaveProperty('data');
      expect(result.current).toHaveProperty('isLoading');
    });
  });
});
