import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  getDirectoryListingResult,
  getDirectoryTypeSummaryResult,
} from '@/lib/api-client/client';
import { buildDirectoryTypeHubMetadata } from '@/lib/seo/metadata';
import { generateDirectoryTypeHubJsonLd } from '@/lib/seo/json-ld';
import type { DirectoryType } from '@/lib/pseo';
import { getDirectorySeed, isDirectoryType } from '@/lib/pseo';
import { DirectoryTypeHub } from '@/components/directory/DirectoryTypeHub';

export const runtime = 'edge';

type DirectoryTypePageProps = {
  params: Promise<{ type: string }>;
};

export async function generateMetadata({ params }: DirectoryTypePageProps): Promise<Metadata> {
  const { type } = await params;
  if (!isDirectoryType(type)) {
    return { robots: { index: false, follow: false } };
  }
  return buildDirectoryTypeHubMetadata(type);
}

export default async function DirectoryTypePage({ params }: DirectoryTypePageProps) {
  const { type } = await params;
  if (!isDirectoryType(type)) {
    notFound();
    return null;
  }

  const normalizedType: DirectoryType = type;
  const seed = getDirectorySeed(normalizedType);
  const [listing, summary] = await Promise.all([
    getDirectoryListingResult(normalizedType, seed.slug, 1, 6),
    getDirectoryTypeSummaryResult(normalizedType, 50),
  ]);
  const jsonLd = generateDirectoryTypeHubJsonLd(normalizedType, seed.slug);
  const notice = listing.status === 'unavailable' || listing.status === 'timeout' || summary.status === 'unavailable' || summary.status === 'timeout'
    ? 'Some directory data is temporarily unavailable. Try the featured live page or refresh later.'
    : null;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <DirectoryTypeHub
        type={normalizedType}
        items={listing.status === 'success' || listing.status === 'empty' ? listing.data.items : []}
        summary={summary.status === 'success' ? summary.data : null}
        notice={notice}
      />
    </>
  );
}
