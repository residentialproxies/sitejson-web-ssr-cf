'use client';

import React, { useEffect, useReducer, useState } from 'react';
import type { Route } from 'next';
import Link from 'next/link';
import { BarChart3, ChevronRight, Hash, Layers, Tag } from 'lucide-react';
import { fetchDirectoryListing } from '@/services/api';
import type { DirectoryItem, DirectoryStats } from '@/lib/api-client/types';
import { getDirectoryDetailFaqs, getDirectoryTypeLabel, getRelatedDirectoryLinks } from '@/lib/pseo';
import { SiteCard } from '@/components/shared/SiteCard';
import { FaqSection } from '@/components/shared/FaqSection';
import { Button } from '@/components/ui/Button';
import { DirectoryStatsPanel } from '@/components/directory/DirectoryStatsPanel';
import { DirectoryClusterTakeaways } from '@/components/directory/DirectoryClusterTakeaways';
import { RelatedResources } from '@/components/domain/RelatedResources';

type PageType = 'category' | 'technology' | 'topic';

interface DirectoryContentProps {
  mode: PageType;
  value: string;
  initialItems: DirectoryItem[];
  initialTotal: number;
  initialTotalPages: number;
  pageSize: number;
  initialPage?: number;
  initialStats?: DirectoryStats | null;
}

type SortOption = 'rank' | 'traffic' | 'score';

type DirectoryState = {
  items: DirectoryItem[];
  total: number;
  page: number;
  totalPages: number;
  loading: boolean;
};

type DirectoryAction =
  | {
      type: 'reset';
      payload: {
        items: DirectoryItem[];
        total: number;
        totalPages: number;
        page?: number;
      };
    }
  | { type: 'set-page'; page: number }
  | {
      type: 'load-success';
      payload: {
        items: DirectoryItem[];
        total: number;
        totalPages: number;
      };
    }
  | { type: 'set-loading'; loading: boolean };

const toDisplayLabel = (input: string): string => input
  .split('-')
  .filter(Boolean)
  .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
  .join(' ');

const icons = {
  category: <Layers className="h-6 w-6 text-blue-500" />,
  technology: <Hash className="h-6 w-6 text-purple-500" />,
  topic: <Tag className="h-6 w-6 text-emerald-500" />,
};

function createInitialState(
  initialItems: DirectoryItem[],
  initialTotal: number,
  initialTotalPages: number,
  initialPage = 1,
): DirectoryState {
  return {
    items: initialItems,
    total: initialTotal,
    page: initialPage,
    totalPages: initialTotalPages,
    loading: false,
  };
}

function directoryReducer(state: DirectoryState, action: DirectoryAction): DirectoryState {
  switch (action.type) {
    case 'reset':
      return createInitialState(action.payload.items, action.payload.total, action.payload.totalPages, action.payload.page);
    case 'set-page':
      return { ...state, page: action.page };
    case 'set-loading':
      return { ...state, loading: action.loading };
    case 'load-success':
      return {
        ...state,
        items: action.payload.items,
        total: action.payload.total,
        totalPages: action.payload.totalPages,
        loading: false,
      };
    default:
      return state;
  }
}

function getDirectoryPageHref(mode: PageType, value: string, page: number): Route {
  return (page <= 1 ? `/directory/${mode}/${value}` : `/directory/${mode}/${value}/page/${page}`) as Route;
}

function getVisiblePages(currentPage: number, totalPages: number): Array<number | 'ellipsis'> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, totalPages, currentPage, currentPage - 1, currentPage + 1]);
  if (currentPage <= 3) {
    pages.add(2);
    pages.add(3);
    pages.add(4);
  }
  if (currentPage >= totalPages - 2) {
    pages.add(totalPages - 1);
    pages.add(totalPages - 2);
    pages.add(totalPages - 3);
  }

  const sortedPages = Array.from(pages)
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);

  const result: Array<number | 'ellipsis'> = [];
  sortedPages.forEach((page, index) => {
    if (index > 0 && page - sortedPages[index - 1] > 1) {
      result.push('ellipsis');
    }
    result.push(page);
  });
  return result;
}

function buildDirectoryStatsSnapshot(mode: PageType, value: string, items: DirectoryItem[]): DirectoryStats | null {
  if (items.length === 0) {
    return null;
  }

  const scoredItems = items.filter((item) => item.legitimacyScore != null);
  const avgLegitimacyScore = scoredItems.length > 0
    ? Math.round(scoredItems.reduce((sum, item) => sum + (item.legitimacyScore ?? 0), 0) / scoredItems.length)
    : null;

  const techCounts = new Map<string, number>();
  const tagCounts = new Map<string, number>();

  items.forEach((item) => {
    (item.techStack ?? []).forEach((name) => {
      techCounts.set(name, (techCounts.get(name) ?? 0) + 1);
    });
    (item.tags ?? []).forEach((name) => {
      tagCounts.set(name, (tagCounts.get(name) ?? 0) + 1);
    });
  });

  const sortEntries = (counts: Map<string, number>) => Array.from(counts.entries())
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .map(([name, count]) => ({ name, count }));

  const rankedItems = items.filter((item) => item.rank != null);
  const trafficDistribution = {
    top10k: rankedItems.filter((item) => (item.rank ?? 0) <= 10_000).length,
    top100k: rankedItems.filter((item) => (item.rank ?? 0) > 10_000 && (item.rank ?? 0) <= 100_000).length,
    top1m: rankedItems.filter((item) => (item.rank ?? 0) > 100_000 && (item.rank ?? 0) <= 1_000_000).length,
    unranked: items.length - rankedItems.length,
  };

  return {
    type: mode,
    slug: value,
    total: items.length,
    avgLegitimacyScore,
    trafficDistribution,
    topTechnologies: sortEntries(techCounts).slice(0, 5),
    topTags: sortEntries(tagCounts).slice(0, 5),
    topCountries: [],
    hasTrafficData: items.filter((item) => item.monthlyVisits != null).length,
  };
}

export default function DirectoryContent({
  mode,
  value,
  initialItems,
  initialTotal,
  initialTotalPages,
  pageSize,
  initialPage = 1,
  initialStats,
}: DirectoryContentProps) {
  const [state, dispatch] = useReducer(
    directoryReducer,
    createInitialState(initialItems, initialTotal, initialTotalPages, initialPage),
  );

  const [sort, setSort] = useState<SortOption>('rank');
  const [minScore, setMinScore] = useState<string>('');
  const [hasTraffic, setHasTraffic] = useState(false);
  const [filterVersion, setFilterVersion] = useState(0);

  const displayValue = toDisplayLabel(value);
  const canGoPrev = state.page > 1;
  const canGoNext = state.totalPages > 0 && state.page < state.totalPages;
  const faqs = getDirectoryDetailFaqs(mode, value);

  const isDefaultFilters = sort === 'rank' && minScore === '' && !hasTraffic;
  const sidebarItems = isDefaultFilters ? initialItems : state.items;
  const sidebarStats = isDefaultFilters
    ? (initialStats ?? buildDirectoryStatsSnapshot(mode, value, initialItems))
    : buildDirectoryStatsSnapshot(mode, value, state.items);
  const relatedLinks = getRelatedDirectoryLinks({ type: mode, slug: value, items: sidebarItems, stats: sidebarStats ?? null, limit: 6 });

  useEffect(() => {
    dispatch({
      type: 'reset',
      payload: {
        items: initialItems,
        total: initialTotal,
        totalPages: initialTotalPages,
        page: initialPage,
      },
    });
  }, [initialItems, initialTotal, initialTotalPages, initialPage, mode, value]);

  useEffect(() => {
    if (state.page === initialPage && filterVersion === 0) {
      return;
    }

    let active = true;
    dispatch({ type: 'set-loading', loading: true });

    const options = {
      sort,
      minScore: minScore !== '' ? Number(minScore) : undefined,
      hasTraffic: hasTraffic || undefined,
    };

    fetchDirectoryListing(mode, value, state.page, pageSize, options)
      .then((data) => {
        if (!active) return;
        const nextData = data ?? { items: [], total: 0, totalPages: 0 };
        dispatch({
          type: 'load-success',
          payload: {
            items: nextData.items,
            total: nextData.total,
            totalPages: nextData.totalPages,
          },
        });
      })
      .finally(() => {
        if (active) dispatch({ type: 'set-loading', loading: false });
      });

    return () => {
      active = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, pageSize, state.page, value, filterVersion]);

  const applyFilters = (newSort: SortOption, newMinScore: string, newHasTraffic: boolean) => {
    setSort(newSort);
    setMinScore(newMinScore);
    setHasTraffic(newHasTraffic);
    dispatch({ type: 'set-page', page: 1 });
    setFilterVersion((v) => v + 1);
  };

  const paginationItems = getVisiblePages(state.page, state.totalPages);

  return (
    <div className="min-h-screen bg-slate-50/70">
      <div className="border-b border-slate-200 bg-white">
        <div className="container mx-auto max-w-7xl px-4 py-10">
          <nav className="mb-6 flex items-center gap-2 text-sm text-slate-500">
            <Link href="/" className="hover:text-slate-900">Home</Link>
            <ChevronRight size={14} />
            <Link href="/directory" className="hover:text-slate-900">Directory</Link>
            <ChevronRight size={14} />
            <Link href={`/directory/${mode}` as Route} className="hover:text-slate-900">{getDirectoryTypeLabel(mode)}</Link>
            <ChevronRight size={14} />
            <span className="text-slate-900">{displayValue}</span>
          </nav>

          <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
            <section className="space-y-8">
              <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50">
                    {icons[mode]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-clay-600">{getDirectoryTypeLabel(mode)}</p>
                    <h1 className="mt-2 text-4xl font-semibold text-slate-900 md:text-5xl">Top {displayValue} Websites</h1>
                    <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-600">
                      Browse live examples related to {displayValue}, then open the strongest domains to inspect traffic,
                      SEO, business posture, and trust signals in more detail.
                    </p>
                  </div>
                </div>

                <div className="mt-8 grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Indexed sites</p>
                    <p className="mt-2 font-mono text-3xl font-bold text-slate-950">{initialTotal.toLocaleString()}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">Use the list to move from a broad cluster into a small report shortlist.</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Coverage</p>
                    <p className="mt-2 flex items-center gap-2 text-lg font-semibold text-slate-900">
                      <BarChart3 className="h-4 w-4 text-clay-600" />
                      {initialStats?.hasTrafficData ?? 0} with traffic data
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">Traffic coverage tells you how many sites in this cluster already support stronger prioritization work.</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Fastest analyst move</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">
                      {initialItems[0]?.domain ? `Open ${initialItems[0].domain}` : `Browse ${displayValue}`}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{initialItems[1]?.domain ? `Then compare it with ${initialItems[1].domain} to tell whether the first result is representative.` : `Then pivot into an adjacent browse path or related report once more sites are indexed.`}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Sort:</span>
                {(['rank', 'traffic', 'score'] as SortOption[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => applyFilters(s, minScore, hasTraffic)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                      sort === s
                        ? 'border-clay-400 bg-clay-50 text-clay-700'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {s === 'rank' ? 'By rank' : s === 'traffic' ? 'By traffic' : 'By score'}
                  </button>
                ))}
                <div className="ml-auto flex items-center gap-3">
                  <label className="flex cursor-pointer items-center gap-1.5 text-xs text-slate-600">
                    <input
                      type="checkbox"
                      checked={hasTraffic}
                      onChange={(e) => applyFilters(sort, minScore, e.target.checked)}
                      className="h-3.5 w-3.5 rounded border-slate-300"
                    />
                    Has traffic data
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-slate-600">
                    <span>Min score:</span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={minScore}
                      onChange={(e) => setMinScore(e.target.value)}
                      onBlur={() => applyFilters(sort, minScore, hasTraffic)}
                      onKeyDown={(e) => e.key === 'Enter' && applyFilters(sort, minScore, hasTraffic)}
                      placeholder="0-100"
                      className="w-16 rounded border border-slate-200 px-2 py-0.5 text-xs"
                    />
                  </label>
                  {!isDefaultFilters && (
                    <button
                      onClick={() => {
                        setSort('rank');
                        setMinScore('');
                        setHasTraffic(false);
                        dispatch({ type: 'set-page', page: 1 });
                        setFilterVersion((v) => v + 1);
                      }}
                      className="text-xs text-slate-400 underline hover:text-slate-600"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>

              {state.loading ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {['skeleton-1', 'skeleton-2', 'skeleton-3', 'skeleton-4', 'skeleton-5', 'skeleton-6'].map((key) => (
                    <div key={key} className="h-64 animate-pulse rounded-xl bg-slate-200" />
                  ))}
                </div>
              ) : state.items.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {state.items.map((site) => (
                    <SiteCard key={site.domain} site={site} />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
                  <h2 className="text-xl font-semibold text-slate-900">No indexed sites yet</h2>
                  <p className="mt-2 text-slate-600">Analyze more domains first, then this directory page will become much richer.</p>
                  <div className="mt-6">
                    <Link href="/">
                      <Button>Analyze a Domain</Button>
                    </Link>
                  </div>
                </div>
              )}

              <div className="flex justify-center gap-4">
                {isDefaultFilters ? (
                  <>
                    {canGoPrev ? (
                      <Link href={getDirectoryPageHref(mode, value, state.page - 1)} className="inline-flex h-11 items-center justify-center rounded-lg border border-ink-200 px-6 text-sm font-medium text-ink-700 transition hover:border-ink-300 hover:bg-ink-50">
                        Previous
                      </Link>
                    ) : (
                      <span className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 px-6 text-sm font-medium text-slate-300">
                        Previous
                      </span>
                    )}
                    {canGoNext ? (
                      <Link href={getDirectoryPageHref(mode, value, state.page + 1)} className="inline-flex h-11 items-center justify-center rounded-lg border border-ink-200 px-6 text-sm font-medium text-ink-700 transition hover:border-ink-300 hover:bg-ink-50">
                        Next Page
                      </Link>
                    ) : (
                      <span className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 px-6 text-sm font-medium text-slate-300">
                        Next Page
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      disabled={!canGoPrev || state.loading}
                      onClick={() => dispatch({ type: 'set-page', page: Math.max(1, state.page - 1) })}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      disabled={!canGoNext || state.loading}
                      onClick={() => dispatch({ type: 'set-page', page: state.page + 1 })}
                    >
                      Next Page
                    </Button>
                  </>
                )}
              </div>

              {state.totalPages > 1 && (
                <nav aria-label="Directory pages" className="flex flex-wrap justify-center gap-2">
                  {isDefaultFilters ? (
                    paginationItems.map((item, index) => item === 'ellipsis' ? (
                      <span key={`ellipsis-${index}`} className="inline-flex h-8 w-8 items-center justify-center text-sm text-slate-400">…</span>
                    ) : (
                      <Link
                        key={item}
                        href={getDirectoryPageHref(mode, value, item)}
                        className={`inline-flex h-8 min-w-8 items-center justify-center rounded-md border px-2 text-sm ${
                          item === state.page
                            ? 'border-clay-500 bg-clay-50 font-semibold text-clay-700'
                            : 'border-slate-200 text-slate-600 hover:border-clay-300 hover:bg-clay-50'
                        }`}
                      >
                        {item}
                      </Link>
                    ))
                  ) : (
                    Array.from({ length: Math.min(state.totalPages, 10) }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        type="button"
                        onClick={() => dispatch({ type: 'set-page', page })}
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-md border text-sm ${
                          page === state.page
                            ? 'border-clay-500 bg-clay-50 font-semibold text-clay-700'
                            : 'border-slate-200 text-slate-600 hover:border-clay-300 hover:bg-clay-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))
                  )}
                </nav>
              )}
            </section>

            <aside id="next-steps" className="space-y-6">
              {sidebarStats && sidebarStats.total > 0 && (
                <>
                  <DirectoryClusterTakeaways label={displayValue} items={sidebarItems} stats={sidebarStats} />
                  <DirectoryStatsPanel stats={sidebarStats} />
                </>
              )}

              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-clay-600">Why this page helps</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">Use {displayValue} as a decision shortcut</h2>
                <p className="mt-4 text-sm leading-relaxed text-slate-600">
                  A directory page reduces the time it takes to move from a broad idea into a shortlist of real domains you
                  can inspect. Treat it as the shortlist layer, not the final answer.
                </p>
              </section>

              <RelatedResources
                title={`Where to go after ${displayValue}`}
                description="Use these links to jump from the directory into live reports, comparisons, and adjacent browse paths without losing context."
                items={relatedLinks}
              />
            </aside>
          </div>

          <div id="faq" className="mt-10">
            <FaqSection
              title={`Questions about ${displayValue}`}
              description="These pages should help visitors understand both the list itself and the next best navigation move."
              items={faqs}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
