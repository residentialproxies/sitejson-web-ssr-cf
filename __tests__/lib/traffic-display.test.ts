import { describe, expect, it } from 'vitest';
import {
  normalizeBounceRateForDisplay,
  normalizeTrafficSourcesPct,
  normalizeTrafficDataForDisplay,
} from '@/lib/traffic-display';

describe('traffic display normalization', () => {
  it('normalizes bounce rate values in 0-1 format', () => {
    expect(normalizeBounceRateForDisplay(0.6315)).toBe(63.15);
  });

  it('keeps bounce rate values already in percent format', () => {
    expect(normalizeBounceRateForDisplay(49.5)).toBe(49.5);
  });

  it('normalizes traffic sources in 0-1 format', () => {
    expect(normalizeTrafficSourcesPct({
      direct: 0.4017,
      search: 0.5034,
      social: 0.0044,
      referral: 0.0864,
      mail: 0.0007,
      paid: 0.0031,
    })).toEqual({
      direct: 40.17,
      search: 50.34,
      social: 0.44,
      referral: 8.64,
      mail: 0.07,
      paid: 0.31,
    });
  });

  it('keeps traffic sources already in percent format', () => {
    expect(normalizeTrafficSourcesPct({
      direct: 35,
      search: 45,
      social: 10,
      referral: 6,
      mail: 2,
      paid: 2,
    })).toEqual({
      direct: 35,
      search: 45,
      social: 10,
      referral: 6,
      mail: 2,
      paid: 2,
    });
  });

  it('normalizes composite traffic data', () => {
    const result = normalizeTrafficDataForDisplay({
      monthlyVisits: 1000,
      bounceRate: 0.42,
      trafficSources: {
        direct: 0.4,
        search: 0.5,
        social: 0.05,
        referral: 0.03,
        mail: 0.01,
        paid: 0.01,
      },
    });

    expect(result?.bounceRate).toBe(42);
    expect(result?.trafficSources?.direct).toBe(40);
    expect(result?.trafficSources?.search).toBe(50);
  });
});
