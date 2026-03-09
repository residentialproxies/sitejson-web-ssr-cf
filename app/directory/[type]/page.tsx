import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDirectory, getDirectoryTypeSummary } from '@/lib/api-client/client';
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
  const [data, summary] = await Promise.all([
    getDirectory(normalizedType, seed.slug, 1, 6),
    getDirectoryTypeSummary(normalizedType, 50),
  ]);
  const jsonLd = generateDirectoryTypeHubJsonLd(normalizedType, seed.slug);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <DirectoryTypeHub type={normalizedType} items={data?.items ?? []} summary={summary} />
    </>
  );
}
