import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { buildDirectoryMetadata } from '@/lib/seo/metadata';
import { getDirectory } from '@/lib/api-client/client';
import { normalizeDirectorySlug } from '@/lib/utils';
import DirectoryContent from './directory-content';

type DirectoryType = 'category' | 'technology' | 'topic';

const defaultSlugs: Record<DirectoryType, string> = {
  category: 'technology',
  technology: 'react',
  topic: 'finance',
};

const normalizeDirectoryType = (type: string): DirectoryType => (
  ['category', 'technology', 'topic'].includes(type) ? (type as DirectoryType) : 'category'
);

export const runtime = 'edge';

type DirectoryPageProps = {
  params: Promise<{
    type: string;
    slug: string;
  }>;
};

export async function generateMetadata({ params }: DirectoryPageProps): Promise<Metadata> {
  const { type, slug } = await params;
  const normalizedType = normalizeDirectoryType(type);
  const normalizedSlug = normalizeDirectorySlug(slug) || defaultSlugs[normalizedType];
  return buildDirectoryMetadata(normalizedType, normalizedSlug);
}

export default async function DirectoryPage({ params }: DirectoryPageProps) {
  const { type, slug } = await params;
  const normalizedType = normalizeDirectoryType(type);
  const normalizedSlug = normalizeDirectorySlug(slug);
  const safeSlug = normalizedSlug || defaultSlugs[normalizedType];

  if (type !== normalizedType || slug !== safeSlug) {
    redirect(`/directory/${normalizedType}/${safeSlug}`);
    return null;
  }

  const data = await getDirectory(normalizedType, safeSlug, 1, 24);
  const items = data?.items ?? [];
  const total = data?.pagination?.total ?? 0;
  const pageSize = data?.pagination?.page_size ?? 24;
  const totalPages = total > 0 ? Math.ceil(total / pageSize) : 0;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Top Websites ${normalizedType === 'technology' ? 'using' : 'in'} ${safeSlug}`,
    description: `Discover the most popular websites ${normalizedType === 'technology' ? 'built with' : 'related to'} ${safeSlug}.`,
    url: `https://sitejson.com/directory/${normalizedType}/${safeSlug}`,
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://sitejson.com' },
        { '@type': 'ListItem', position: 2, name: normalizedType.charAt(0).toUpperCase() + normalizedType.slice(1) },
        { '@type': 'ListItem', position: 3, name: safeSlug.charAt(0).toUpperCase() + safeSlug.slice(1) },
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <DirectoryContent
        mode={normalizedType}
        value={safeSlug}
        initialItems={items}
        initialTotal={total}
        initialTotalPages={totalPages}
        pageSize={pageSize}
      />
    </>
  );
}
