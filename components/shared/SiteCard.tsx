import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, Globe } from 'lucide-react';
import type { DirectoryItem } from '../../lib/api-client/types';
import { Card } from '../ui/Card';
import { formatNumber } from '../../lib/utils';

interface SiteCardProps {
  site: DirectoryItem;
}

const fallbackScreenshot = (domain: string) =>
  `https://image.thum.io/get/width/600/noanimate/https://${domain}`;

const scoreBadgeClass = (score: number): string => {
  if (score >= 70) return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  if (score >= 40) return 'border-amber-200 bg-amber-50 text-amber-700';
  return 'border-rose-200 bg-rose-50 text-rose-700';
};

const formatVisits = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
};

export const SiteCard: React.FC<SiteCardProps> = ({ site }) => {
  const imgSrc = site.screenshotUrl || fallbackScreenshot(site.domain);
  const displayTags = (site.tags?.length ? site.tags : site.techStack)?.slice(0, 3) ?? [];

  return (
    <Link href={`/data/${site.domain}`} className="group block h-full">
      <Card className="h-full overflow-hidden rounded-3xl border-slate-200 bg-white transition-all duration-300 group-hover:-translate-y-1 group-hover:border-clay-200 group-hover:shadow-lg">
        <div className="relative h-36 overflow-hidden border-b border-slate-100 bg-slate-100">
          <Image
            src={imgSrc}
            alt={site.domain}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover object-top opacity-90 transition-opacity group-hover:opacity-100"
            unoptimized={!!site.screenshotUrl}
          />
          <div className="absolute inset-x-3 top-3 flex flex-wrap gap-2">
            {typeof site.rank === 'number' && site.rank > 0 && (
              <span className="rounded-full border border-slate-200 bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-slate-900 backdrop-blur">
                #{formatNumber(site.rank)} rank
              </span>
            )}
            {typeof site.legitimacyScore === 'number' && (
              <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold backdrop-blur ${scoreBadgeClass(site.legitimacyScore)}`}>
                {site.legitimacyScore}/100 trust
              </span>
            )}
          </div>
        </div>

        <div className="flex h-full flex-col p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Image
                  src={`https://www.google.com/s2/favicons?domain=${site.domain}&sz=32`}
                  alt=""
                  width={16}
                  height={16}
                  className="h-4 w-4 rounded-sm"
                />
                <p className="truncate text-lg font-semibold text-slate-900">{site.domain}</p>
              </div>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Live website report</p>
            </div>
            <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-slate-400 transition group-hover:text-clay-600" />
          </div>

          <p className="mt-4 min-h-[3.25rem] text-sm leading-6 text-slate-600">
            {site.description || site.title || site.domain}
          </p>

          {displayTags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {displayTags.map((tag) => (
                <span key={tag} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Globe size={12} />
              <span>{site.domain}</span>
            </div>
            {typeof site.monthlyVisits === 'number' && site.monthlyVisits > 0 && (
              <span className="text-xs font-semibold text-slate-700">{formatVisits(site.monthlyVisits)}/mo</span>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
};
