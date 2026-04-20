import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Globe, Hash, Star, Tag } from 'lucide-react';
import { getSiteAlternatives } from '@/lib/api-client/client';
import { evaluateAlternativesIndexability } from '@/lib/seo/indexability';
import { buildDataSubPageMetadata } from '@/lib/seo/metadata';
import { SectionGuide } from '@/components/domain/SectionGuide';
import { FaqSection } from '@/components/shared/FaqSection';
import { getAlternativesFaqs } from '@/lib/pseo';
import { formatNumber } from '@/lib/utils';

export const runtime = 'edge';

type AlternativesPageProps = {
  params: Promise<{
    domain: string;
  }>;
};

export async function generateMetadata({ params }: AlternativesPageProps): Promise<Metadata> {
  const { domain } = await params;
  const result = await getSiteAlternatives(domain);
  const decision = evaluateAlternativesIndexability(result?.items ?? null);

  return buildDataSubPageMetadata(domain, 'alternatives', {
    index: decision.index,
    follow: decision.follow,
  });
}

export default async function AlternativesPage({ params }: AlternativesPageProps) {
  const { domain } = await params;
  const result = await getSiteAlternatives(domain);
  const alternatives = result?.items ?? [];
  const faqs = getAlternativesFaqs(domain);

  return (
    <div className="space-y-6">
      <SectionGuide section="alternatives" />

      {alternatives.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 text-center">
          <Globe className="w-8 h-8 text-gray-400 mx-auto mb-3" />
          <h2 className="text-lg font-medium text-gray-900 mb-1">No alternatives found</h2>
          <p className="text-sm text-gray-500">
            No alternative or competing websites have been identified for{' '}
            <span className="font-medium text-gray-700">{domain}</span> yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {alternatives.map((alt, index) => (
            <Link
              key={alt.domain}
              href={`/data/${alt.domain}`}
              className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 hover:border-blue-300 hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-500 shrink-0">
                    {index + 1}
                  </span>
                  <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 truncate">
                    {alt.domain}
                  </h3>
                </div>
              </div>

              {alt.title && (
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">{alt.title}</p>
              )}

              <div className="flex flex-wrap gap-2 mb-3">
                {alt.rank != null && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-700 border border-blue-200">
                    <Hash className="w-3 h-3" />
                    {formatNumber(alt.rank)}
                  </span>
                )}
                {alt.score != null && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <Star className="w-3 h-3" />
                    {alt.score}/100
                  </span>
                )}
              </div>

              {alt.reasons && alt.reasons.length > 0 && (
                <div className="space-y-1">
                  {alt.reasons.slice(0, 3).map((reason) => (
                    <div key={reason} className="flex items-start gap-1.5">
                      <Tag className="w-3 h-3 text-gray-400 mt-0.5 shrink-0" />
                      <span className="text-xs text-gray-600">{reason}</span>
                    </div>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}

      <FaqSection
        title={`Alternatives to ${domain}`}
        description="Common questions about finding and comparing alternatives."
        items={faqs}
      />
    </div>
  );
}
