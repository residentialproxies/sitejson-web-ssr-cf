import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useSiteData } from '@/hooks/use-site-poll';
import { fetchSiteData } from '@/services/api';

vi.mock('@/services/api', () => ({
  fetchSiteData: vi.fn(),
}));

const mockFetchSiteData = vi.mocked(fetchSiteData);

const flushMicrotasks = async () => {
  await act(async () => {
    await Promise.resolve();
  });
};

describe('useSiteData', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockFetchSiteData.mockReset();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('should clear old poll timer before scheduling refresh polling', async () => {
    mockFetchSiteData
      .mockResolvedValueOnce({ status: 'processing', progress: 10, message: 'Queued...' })
      .mockResolvedValueOnce({ status: 'processing', progress: 20, message: 'Queued...' })
      .mockResolvedValue({ status: 'completed', data: { domain: 'example.com' } });

    const { result } = renderHook(() => useSiteData('example.com'));
    await flushMicrotasks();
    expect(mockFetchSiteData).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.refresh();
    });
    await flushMicrotasks();
    expect(mockFetchSiteData).toHaveBeenCalledTimes(2);
    expect(mockFetchSiteData).toHaveBeenNthCalledWith(2, 'example.com', true);

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    await flushMicrotasks();

    expect(mockFetchSiteData).toHaveBeenCalledTimes(3);
  });
});
