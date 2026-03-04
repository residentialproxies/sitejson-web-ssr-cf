import { useState, useEffect, useCallback, useRef } from 'react';
import type { SiteReport } from '../lib/api-client/types';
import type { ApiResponse } from '../lib/types';
import { fetchSiteData } from '../services/api';

interface UseSiteDataResult {
  data: SiteReport | null;
  isStale: boolean;
  isLoading: boolean;
  isProcessing: boolean;
  progress: number;
  error: string | null;
  refresh: () => void;
  statusMessage: string;
}

export function useSiteData(domain: string): UseSiteDataResult {
  const [data, setData] = useState<SiteReport | null>(null);
  const [isStale, setIsStale] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("Initializing...");

  const stopPollingRef = useRef(false);
  const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlightRef = useRef(false);
  const generationRef = useRef(0);
  const pollRef = useRef<() => Promise<void>>(async () => {});

  const clearPollTimeout = useCallback(() => {
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current);
      pollTimeoutRef.current = null;
    }
  }, []);

  const schedulePoll = useCallback((delayMs = 2000) => {
    clearPollTimeout();
    if (stopPollingRef.current) return;
    pollTimeoutRef.current = setTimeout(() => {
      void pollRef.current();
    }, delayMs);
  }, [clearPollTimeout]);

  const applyResponse = useCallback((response: ApiResponse) => {
    if (response.status === 'error') {
      setError(response.message || 'Unknown error occurred');
      setIsLoading(false);
      setIsProcessing(false);
      return;
    }

    if (response.status === 'completed' && response.data) {
      setData(response.data);
      setIsStale(Boolean(response.is_stale));
      setProgress(100);
      setStatusMessage('Analysis complete');
      setIsLoading(false);
      setIsProcessing(false);
      return;
    }

    if (response.status === 'processing') {
      setIsProcessing(true);
      setIsLoading(false);
      setError(null);
      if (typeof response.progress === 'number' && Number.isFinite(response.progress)) {
        setProgress((prev) => {
          const normalized = Math.max(0, Math.min(95, Math.floor(response.progress ?? 0)));
          return Math.max(prev, normalized);
        });
      }
      const nextMessage = response.message || response.stage || 'Analyzing...';
      setStatusMessage((prev) => (prev === nextMessage ? prev : nextMessage));
    }
  }, []);

  const poll = useCallback(async () => {
    if (stopPollingRef.current || inFlightRef.current) return;

    const generation = generationRef.current;
    inFlightRef.current = true;

    try {
      const response = await fetchSiteData(domain);

      if (stopPollingRef.current || generation !== generationRef.current) {
        return;
      }

      applyResponse(response);
      if (response.status === 'processing') {
        schedulePoll();
      } else {
        clearPollTimeout();
      }
    } catch (err) {
      if (stopPollingRef.current || generation !== generationRef.current) {
        return;
      }
      let message = 'Failed to load site data';
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        message = 'Network error — check your connection';
      } else if (err instanceof DOMException && err.name === 'AbortError') {
        message = 'Request timed out';
      }
      setError(message);
      setIsLoading(false);
      setIsProcessing(false);
    } finally {
      inFlightRef.current = false;
    }
  }, [applyResponse, clearPollTimeout, domain, schedulePoll]);

  useEffect(() => {
    pollRef.current = poll;
  }, [poll]);

  useEffect(() => {
    generationRef.current += 1;
    clearPollTimeout();
    inFlightRef.current = false;

    if (!domain) {
      setIsLoading(false);
      setIsProcessing(false);
      return;
    }

    setIsLoading(true);
    setIsProcessing(false);
    setError(null);
    setProgress(0);
    setStatusMessage('Initializing...');
    stopPollingRef.current = false;

    void poll();

    return () => {
      stopPollingRef.current = true;
      clearPollTimeout();
    };
  }, [clearPollTimeout, domain, poll]);

  useEffect(() => {
    if (!isProcessing) return;

    const messages = ['Queued...', 'Fetching DNS...', 'Running Providers...', 'Building Report...'];
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        const increment = prev > 60 ? 2 : 8;
        return Math.min(prev + increment, 90);
      });
      setStatusMessage((prev) => {
        const idx = messages.indexOf(prev);
        if (idx === -1) return prev;
        return messages[(idx + 1) % messages.length];
      });
    }, 800);

    return () => {
      clearInterval(interval);
    };
  }, [isProcessing]);

  const refresh = useCallback(() => {
    generationRef.current += 1;
    clearPollTimeout();
    stopPollingRef.current = false;

    setIsLoading(true);
    setIsProcessing(false);
    setError(null);
    setData(null);
    setIsStale(false);
    setProgress(0);
    setStatusMessage('Refreshing...');

    void fetchSiteData(domain, true).then((response) => {
      if (stopPollingRef.current) return;

      applyResponse(response);
      if (response.status === 'processing') {
        schedulePoll();
      } else {
        clearPollTimeout();
      }
    }).catch(() => {
      if (stopPollingRef.current) return;
      setError('Network error during refresh');
      setIsLoading(false);
      setIsProcessing(false);
      clearPollTimeout();
    });
  }, [applyResponse, clearPollTimeout, domain, schedulePoll]);

  useEffect(() => {
    return () => {
      stopPollingRef.current = true;
      clearPollTimeout();
    };
  }, [clearPollTimeout]);

  return { data, isStale, isLoading, isProcessing, progress, error, refresh, statusMessage };
}
