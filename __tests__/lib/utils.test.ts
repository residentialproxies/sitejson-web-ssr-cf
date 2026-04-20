import { describe, it, expect } from 'vitest';
import {
  cn,
  formatNumber,
  formatDuration,
  formatDurationHMS,
  formatBigNumber,
  getRankBadgeColor,
  getRelativeTime,
  normalizeDirectorySlug,
} from '@/lib/utils';

describe('cn', () => {
  it('should merge class names correctly', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz');
    expect(cn('foo', null, undefined, 'bar')).toBe('foo bar');
  });

  it('should handle tailwind class conflicts', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
    expect(cn('text-sm', 'text-lg')).toBe('text-lg');
    expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
  });

  it('should handle conditional classes', () => {
    const isActive = true;
    const isDisabled = false;
    expect(cn('base', isActive && 'active', isDisabled && 'disabled')).toBe('base active');
  });
});

describe('formatNumber', () => {
  it('should format numbers less than 1000 as-is', () => {
    expect(formatNumber(0)).toBe('0');
    expect(formatNumber(999)).toBe('999');
    expect(formatNumber(500)).toBe('500');
  });

  it('should format thousands with K suffix', () => {
    expect(formatNumber(1000)).toBe('1.0K');
    expect(formatNumber(1500)).toBe('1.5K');
    expect(formatNumber(999999)).toBe('1000.0K');
  });

  it('should format millions with M suffix', () => {
    expect(formatNumber(1000000)).toBe('1.0M');
    expect(formatNumber(2500000)).toBe('2.5M');
    expect(formatNumber(1000000000)).toBe('1000.0M');
  });
});

describe('formatDuration', () => {
  it('should format seconds only', () => {
    expect(formatDuration(30)).toBe('0m 30s');
    expect(formatDuration(59)).toBe('0m 59s');
  });

  it('should format minutes and seconds', () => {
    expect(formatDuration(60)).toBe('1m 0s');
    expect(formatDuration(90)).toBe('1m 30s');
    expect(formatDuration(125)).toBe('2m 5s');
  });

  it('should format hours worth of seconds', () => {
    expect(formatDuration(3600)).toBe('60m 0s');
    expect(formatDuration(3661)).toBe('61m 1s');
  });
});

describe('formatDurationHMS', () => {
  it('should format as HH:MM:SS', () => {
    expect(formatDurationHMS(0)).toBe('00:00:00');
    expect(formatDurationHMS(30)).toBe('00:00:30');
    expect(formatDurationHMS(60)).toBe('00:01:00');
    expect(formatDurationHMS(3661)).toBe('01:01:01');
    expect(formatDurationHMS(7322)).toBe('02:02:02');
  });

  it('should pad single digits with zeros', () => {
    expect(formatDurationHMS(5)).toBe('00:00:05');
    expect(formatDurationHMS(65)).toBe('00:01:05');
    expect(formatDurationHMS(3605)).toBe('01:00:05');
  });
});

describe('formatBigNumber', () => {
  it('should format numbers less than 1000 as-is', () => {
    expect(formatBigNumber(0)).toBe('0');
    expect(formatBigNumber(999)).toBe('999');
  });

  it('should format thousands with K suffix', () => {
    expect(formatBigNumber(1000)).toBe('1.00K');
    expect(formatBigNumber(1500)).toBe('1.50K');
    expect(formatBigNumber(999999)).toBe('1000.00K');
  });

  it('should format millions with M suffix', () => {
    expect(formatBigNumber(1000000)).toBe('1.00M');
    expect(formatBigNumber(2500000)).toBe('2.50M');
    expect(formatBigNumber(999999999)).toBe('1000.00M');
  });

  it('should format billions with B suffix', () => {
    expect(formatBigNumber(1000000000)).toBe('1.00B');
    expect(formatBigNumber(2500000000)).toBe('2.50B');
  });
});

describe('getRankBadgeColor', () => {
  it('should return gold for top 100', () => {
    expect(getRankBadgeColor(1)).toContain('yellow');
    expect(getRankBadgeColor(50)).toContain('yellow');
    expect(getRankBadgeColor(100)).toContain('yellow');
  });

  it('should return silver for ranks 101-1000', () => {
    expect(getRankBadgeColor(101)).toContain('slate');
    expect(getRankBadgeColor(500)).toContain('slate');
    expect(getRankBadgeColor(1000)).toContain('slate');
  });

  it('should return blue for ranks 1001-100000', () => {
    expect(getRankBadgeColor(1001)).toContain('blue');
    expect(getRankBadgeColor(50000)).toContain('blue');
    expect(getRankBadgeColor(100000)).toContain('blue');
  });

  it('should return gray for ranks above 100000', () => {
    expect(getRankBadgeColor(100001)).toContain('gray');
    expect(getRankBadgeColor(1000000)).toContain('gray');
  });
});

describe('getRelativeTime', () => {
  it('should return "Just now" for recent timestamps', () => {
    const now = new Date().toISOString();
    expect(getRelativeTime(now)).toBe('Just now');
  });

  it('should return minutes for timestamps within an hour', () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    expect(getRelativeTime(fiveMinutesAgo)).toBe('5m ago');
  });

  it('should return hours for timestamps within a day', () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
    expect(getRelativeTime(threeHoursAgo)).toBe('3h ago');
  });

  it('should return days for older timestamps', () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
    expect(getRelativeTime(twoDaysAgo)).toBe('2d ago');
  });
});

describe('normalizeDirectorySlug', () => {
  it('normalizes punctuation-heavy labels to safe slugs', () => {
    expect(normalizeDirectorySlug('Next.js')).toBe('nextjs');
    expect(normalizeDirectorySlug('Cloud & AI')).toBe('cloud-and-ai');
    expect(normalizeDirectorySlug('  SEO Tools  ')).toBe('seo-tools');
  });

  it('matches the shared P0 slug examples', () => {
    expect(normalizeDirectorySlug('Technology & Computing')).toBe('technology-and-computing');
    expect(normalizeDirectorySlug('AI/ML')).toBe('ai-ml');
    expect(normalizeDirectorySlug('Café SaaS')).toBe('cafe-saas');
    expect(normalizeDirectorySlug('React.js')).toBe('reactjs');
    expect(normalizeDirectorySlug('Sales & CRM')).toBe('sales-and-crm');
    expect(normalizeDirectorySlug('Children’s Media')).toBe('childrens-media');
    expect(normalizeDirectorySlug('News/Politics')).toBe('news-politics');
  });

  it('returns empty string when input has no slug-safe characters', () => {
    expect(normalizeDirectorySlug('...')).toBe('');
    expect(normalizeDirectorySlug('   ')).toBe('');
  });
});
