import { cache } from 'react';
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import {
  getDirectoryListingResult,
  getDirectoryStatsResult,
} from '@/lib/api-client/client';
import { getDirectoryDetailFaqs, getDirectorySeed, isDirectoryType } from '@/lib/pseo';
import { evaluateDirectoryIndexability } from '@/lib/seo/indexability';
import { buildDirectoryMetadata } from '@/lib/seo/metadata';
import { generateDirectoryPageJsonLd } from '@/lib/seo/json-ld';
import { normalizeDirectorySlug } from '@/lib/utils';
import DirectoryContent from './directory-content';

export const runtime = 'edge';

const loadDirectoryListing = cache(
  async (type: string, slug: string) => getDirectoryListingResult(type, slug, 1, 24),
);

const loadDirectoryStats = cache(
  async (type: string, slug: string) => getDirectoryStatsResult(type, slug),
);

type DirectoryPageProps = {
  params: Promise<{
    type: string;
    slug: string;
  }>;
};

export async function generateMetadata({ params }: DirectoryPageProps): Promise<Metadata> {
  const { type, slug } = await params;
  if (!isDirectoryType(type)) {
    return { robots: { index: false, follow: false } };
  }

  const seed = getDirectorySeed(type);
  const normalizedSlug = normalizeDirectorySlug(slug) || seed.slug;
  const [listing, statsResult] = await Promise.all([
    loadDirectoryListing(type, normalizedSlug),
    loadDirectoryStats(type, normalizedSlug),
  ]);
  const decision = evaluateDirectoryIndexability(
    listing.data,
    statsResult.status === 'success' ? statsResult.data : null,
  );

  return buildDirectoryMetadata(type, normalizedSlug, {
    index: decision.index,
  });
}

export default async function DirectoryPage({ params }: DirectoryPageProps) {
  const { type, slug } = await params;
  if (!isDirectoryType(type)) {
    notFound();
    return null;
  }

  const normalizedType = type;
  const seed = getDirectorySeed(normalizedType);
  const normalizedSlug = normalizeDirectorySlug(slug);
  const safeSlug = normalizedSlug || seed.slug;

  if (slug !== safeSlug) {
    redirect(`/directory/${normalizedType}/${safeSlug}`);
    return null;
  }

  const [listing, statsResult] = await Promise.all([
    loadDirectoryListing(normalizedType, safeSlug),
    loadDirectoryStats(normalizedType, safeSlug),
  ]);
  const faqs = getDirectoryDetailFaqs(normalizedType, safeSlug);
  const jsonLd = generateDirectoryPageJsonLd({ type: normalizedType, slug: safeSlug, faqs });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <DirectoryContent
        mode={normalizedType}
        value={safeSlug}
        initialListing={listing.data ?? { items: [], page: 1, pageSize: 24, total: 0, totalPages: 0 }}
        initialStatus={listing.status}
        initialMessage={listing.status === 'unavailable' || listing.status === 'timeout' ? listing.message : null}
        pageSize={listing.data?.pageSize ?? 24}
        initialStats={statsResult.status === 'success' ? statsResult.data : null}
      />
    </>
  );
}
