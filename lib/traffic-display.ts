import type { SiteReport } from '@/lib/api-client/types';

type TrafficData = SiteReport['trafficData'];
type TrafficSources = NonNullable<TrafficData>['trafficSources'];

const round2 = (value: number) => Math.round(value * 100) / 100;
const clampPercent = (value: number) => Math.min(100, Math.max(0, value));

export function normalizeBounceRateForDisplay(value: number | null | undefined): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return null;
  }
  const normalized = value <= 1 ? value * 100 : value;
  return round2(clampPercent(normalized));
}

export function normalizeTrafficSourcesPct(
  sources: TrafficSources | null | undefined,
): TrafficSources | undefined {
  if (!sources) {
    return undefined;
  }

  const values = Object.values(sources).filter((value) => Number.isFinite(value));
  if (values.length === 0) {
    return undefined;
  }

  const asFraction = values.every((value) => value <= 1);
  const normalize = (value: number) => round2(clampPercent(asFraction ? value * 100 : value));

  return {
    direct: normalize(sources.direct),
    search: normalize(sources.search),
    social: normalize(sources.social),
    referral: normalize(sources.referral),
    mail: normalize(sources.mail),
    paid: normalize(sources.paid),
  };
}

export function normalizeTrafficDataForDisplay(traffic: TrafficData): TrafficData {
  if (!traffic) {
    return traffic;
  }

  return {
    ...traffic,
    bounceRate: normalizeBounceRateForDisplay(traffic.bounceRate),
    trafficSources: normalizeTrafficSourcesPct(traffic.trafficSources),
  };
}
