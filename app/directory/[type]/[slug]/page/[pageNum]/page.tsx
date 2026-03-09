import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getDirectory } from '@/lib/api-client/client';
import { getDirectorySeed, isDirectoryType } from '@/lib/pseo';
import { buildPaginatedDirectoryMetadata } from '@/lib/seo/metadata';
import { generateDirectoryPageJsonLd } from '@/lib/seo/json-ld';
import { normalizeDirectorySlug } from '@/lib/utils';
import DirectoryContent from '../../directory-content';

export const runtime = 'edge';

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
  const data = await getDirectory(type, normalizedSlug, 1, 1);
  const total = data?.pagination?.total ?? 0;
  const pageSize = data?.pagination?.page_size ?? 24;
  const totalPages = total > 0 ? Math.ceil(total / pageSize) : 0;

  return buildPaginatedDirectoryMetadata(type, normalizedSlug, pageNum, totalPages);
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

  const data = await getDirectory(normalizedType, safeSlug, pageNum, 24);
  const items = data?.items ?? [];
  const total = data?.pagination?.total ?? 0;
  const pageSize = data?.pagination?.page_size ?? 24;
  const totalPages = total > 0 ? Math.ceil(total / pageSize) : 0;

  if (pageNum > totalPages) {
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
        initialItems={items}
        initialTotal={total}
        initialTotalPages={totalPages}
        pageSize={pageSize}
        initialPage={pageNum}
      />
    </>
  );
}
