import type { Metadata } from 'next';
import { getDirectory, getDirectoryTypeSummary, getGlobalInsights } from '@/lib/api-client/client';
import { buildDirectoryHubMetadata } from '@/lib/seo/metadata';
import { generateDirectoryHubJsonLd } from '@/lib/seo/json-ld';
import { DIRECTORY_TYPE_ORDER, getDirectorySeed } from '@/lib/pseo';
import { DirectoryHubOverview } from '@/components/directory/DirectoryHubOverview';

export const runtime = 'edge';

export const metadata: Metadata = buildDirectoryHubMetadata();

export default async function DirectoryIndexPage() {
  const [previews, summaries, insights] = await Promise.all([
    Promise.all(
      DIRECTORY_TYPE_ORDER.map(async (type) => {
        const seed = getDirectorySeed(type);
        const data = await getDirectory(type, seed.slug, 1, 4);
        return [type, data?.items ?? []] as const;
      }),
    ),
    Promise.all(
      DIRECTORY_TYPE_ORDER.map(async (type) => {
        const summary = await getDirectoryTypeSummary(type, 1);
        return [type, summary?.totalSites ?? 0] as const;
      }),
    ),
    getGlobalInsights(),
  ]);

  const previewMap = Object.fromEntries(previews);
  const totalsMap = Object.fromEntries(summaries) as Record<string, number>;
  const jsonLd = generateDirectoryHubJsonLd();

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <DirectoryHubOverview previews={previewMap} totals={totalsMap} insights={insights} />
    </>
  );
}
