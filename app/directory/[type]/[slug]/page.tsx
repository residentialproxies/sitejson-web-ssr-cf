import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { getDirectory, getDirectoryStats } from '@/lib/api-client/client';
import { getDirectoryDetailFaqs, getDirectorySeed, isDirectoryType } from '@/lib/pseo';
import { buildDirectoryMetadata } from '@/lib/seo/metadata';
import { generateDirectoryPageJsonLd } from '@/lib/seo/json-ld';
import { normalizeDirectorySlug } from '@/lib/utils';
import DirectoryContent from './directory-content';

export const runtime = 'edge';

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
  const data = await getDirectory(type, normalizedSlug, 1, 1);
  const hasResults = (data?.pagination?.total ?? 0) > 0;

  return buildDirectoryMetadata(type, normalizedSlug, { index: hasResults });
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

  const [data, stats] = await Promise.all([
    getDirectory(normalizedType, safeSlug, 1, 24),
    getDirectoryStats(normalizedType, safeSlug),
  ]);
  const items = data?.items ?? [];
  const total = data?.pagination?.total ?? 0;
  const pageSize = data?.pagination?.page_size ?? 24;
  const totalPages = total > 0 ? Math.ceil(total / pageSize) : 0;
  const faqs = getDirectoryDetailFaqs(normalizedType, safeSlug);
  const jsonLd = generateDirectoryPageJsonLd({ type: normalizedType, slug: safeSlug, faqs });

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
        initialStats={stats}
      />
    </>
  );
}
