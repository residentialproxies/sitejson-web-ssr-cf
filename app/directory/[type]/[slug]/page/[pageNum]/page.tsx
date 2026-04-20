import { cache } from 'react';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getDirectoryListingResult, getDirectoryStatsResult } from '@/lib/api-client/client';
import { getDirectorySeed, isDirectoryType } from '@/lib/pseo';
import {
  evaluateDirectoryIndexability,
  evaluatePaginatedDirectoryIndexability,
} from '@/lib/seo/indexability';
import { buildPaginatedDirectoryMetadata } from '@/lib/seo/metadata';
import { generateDirectoryPageJsonLd } from '@/lib/seo/json-ld';
import { normalizeDirectorySlug } from '@/lib/utils';
import DirectoryContent from '../../directory-content';

export const runtime = 'edge';

const loadDirectoryListing = cache(
  async (type: string, slug: string, pageNum: number) => getDirectoryListingResult(type, slug, pageNum, 24),
);

const loadBaseDirectoryListing = cache(
  async (type: string, slug: string) => getDirectoryListingResult(type, slug, 1, 24),
);

const loadDirectoryStats = cache(
  async (type: string, slug: string) => getDirectoryStatsResult(type, slug),
);

type PaginatedDirectoryPageProps = {
  params: Promise<{
    type: string;
    slug: string;
    pageNum: string;
  }>;
};

export async function generateMetadata({ params }: PaginatedDirectoryPageProps): Promise<Metadata> {
  const { type, slug, pageNum: pageNumStr } = await params;
  const pageNum = Number(pageNumStr);
  if (!Number.isInteger(pageNum) || pageNum < 2 || !isDirectoryType(type)) {
    return {};
  }

  const seed = getDirectorySeed(type);
  const normalizedSlug = normalizeDirectorySlug(slug) || seed.slug;
  const [baseListing, listing, statsResult] = await Promise.all([
    loadBaseDirectoryListing(type, normalizedSlug),
    loadDirectoryListing(type, normalizedSlug, pageNum),
    loadDirectoryStats(type, normalizedSlug),
  ]);
  const totalPages = listing.data?.totalPages ?? 0;
  const baseDecision = evaluateDirectoryIndexability(
    baseListing.data,
    statsResult.status === 'success' ? statsResult.data : null,
  );
  const decision = evaluatePaginatedDirectoryIndexability({
    pageNum,
    listing: listing.data,
    baseDecision,
  });
  const metadata = buildPaginatedDirectoryMetadata(type, normalizedSlug, pageNum, totalPages, {
    index: decision.index,
    follow: decision.follow,
  });

  return metadata;
}

export default async function PaginatedDirectoryPage({ params }: PaginatedDirectoryPageProps) {
  const { type, slug, pageNum: pageNumStr } = await params;
  const pageNum = Number(pageNumStr);

  if (!isDirectoryType(type)) {
    notFound();
    return null;
  }

  if (pageNumStr === '1' || pageNum === 1) {
    const safeSlug = normalizeDirectorySlug(slug) || getDirectorySeed(type).slug;
    redirect(`/directory/${type}/${safeSlug}`);
    return null;
  }

  if (!Number.isInteger(pageNum) || pageNum < 1) {
    notFound();
    return null;
  }

  const normalizedType = type;
  const seed = getDirectorySeed(normalizedType);
  const normalizedSlug = normalizeDirectorySlug(slug);
  const safeSlug = normalizedSlug || seed.slug;

  if (slug !== safeSlug) {
    redirect(`/directory/${normalizedType}/${safeSlug}/page/${pageNum}`);
    return null;
  }

  const listing = await loadDirectoryListing(normalizedType, safeSlug, pageNum);
  const totalPages = listing.data?.totalPages ?? 0;

  if ((listing.status === 'success' || listing.status === 'empty') && pageNum > totalPages) {
    notFound();
    return null;
  }

  const jsonLd = generateDirectoryPageJsonLd({ type: normalizedType, slug: safeSlug, pageNum });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <DirectoryContent
        mode={normalizedType}
        value={safeSlug}
        initialListing={listing.data ?? { items: [], page: pageNum, pageSize: 24, total: 0, totalPages: 0 }}
        initialStatus={listing.status}
        initialMessage={listing.status === 'unavailable' || listing.status === 'timeout' ? listing.message : null}
        pageSize={listing.data?.pageSize ?? 24}
        initialPage={pageNum}
      />
    </>
  );
}
