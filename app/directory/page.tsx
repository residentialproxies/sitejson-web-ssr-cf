import type { Metadata } from 'next';
import {
  getDirectoryListingResult,
  getDirectoryTypeSummaryResult,
  getGlobalInsightsResult,
} from '@/lib/api-client/client';
import { buildDirectoryHubMetadata } from '@/lib/seo/metadata';
import { generateDirectoryHubJsonLd } from '@/lib/seo/json-ld';
import { DIRECTORY_TYPE_ORDER, getDirectorySeed } from '@/lib/pseo';
import { DirectoryHubOverview } from '@/components/directory/DirectoryHubOverview';

export const runtime = 'edge';

export const metadata: Metadata = buildDirectoryHubMetadata();

export default async function DirectoryIndexPage() {
  let hasPartialDirectoryData = false;
  const [previews, summaries, insightsResult] = await Promise.all([
    Promise.all(
      DIRECTORY_TYPE_ORDER.map(async (type) => {
        const seed = getDirectorySeed(type);
        const result = await getDirectoryListingResult(type, seed.slug, 1, 4);
        if (result.status === 'unavailable' || result.status === 'timeout') {
          hasPartialDirectoryData = true;
        }
        return [type, result.status === 'success' || result.status === 'empty' ? result.data.items : []] as const;
      }),
    ),
    Promise.all(
      DIRECTORY_TYPE_ORDER.map(async (type) => {
        const summary = await getDirectoryTypeSummaryResult(type, 1);
        if (summary.status === 'unavailable' || summary.status === 'timeout') {
          hasPartialDirectoryData = true;
        }
        return [type, summary.status === 'success' ? summary.data.totalSites : 0] as const;
      }),
    ),
    getGlobalInsightsResult(),
  ]);

  const previewMap = Object.fromEntries(previews);
  const totalsMap = Object.fromEntries(summaries) as Record<string, number>;
  const jsonLd = generateDirectoryHubJsonLd();
  const notice = hasPartialDirectoryData || insightsResult.status === 'unavailable' || insightsResult.status === 'timeout'
    ? 'Some directory rollups are temporarily unavailable. Live preview links below still work.'
    : null;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <DirectoryHubOverview
        previews={previewMap}
        totals={totalsMap}
        insights={insightsResult.status === 'success' ? insightsResult.data : null}
        notice={notice}
      />
    </>
  );
}
