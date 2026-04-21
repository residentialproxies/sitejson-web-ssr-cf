'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Clock, ExternalLink, RefreshCw, ShieldCheck, ChartBar as BarChart3, Layers as Layers3 } from 'lucide-react';
import type { SiteReport } from '@/lib/api-client/types';
import { cn, formatNumber, generateBlurPlaceholder, getFaviconUrl, getRelativeTime, getScreenshotUrl, normalizeDirectorySlug } from '@/lib/utils';

interface DomainHeaderProps {
  domain: string;
  report: SiteReport;
  updatedAt: string;
  isStale: boolean;
  className?: string;
}

const factPillClass = 'inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold';

export function DomainHeader({ domain, report, updatedAt, isStale, className }: DomainHeaderProps) {
  const screenshotUrl = report.visual?.screenshotUrl || getScreenshotUrl(domain, 'large', { format: 'webp', quality: 85 });
  const faviconUrl = getFaviconUrl(domain, 32);
  const techStack = report.meta?.techStackDetected ?? [];
  const blurPlaceholder = generateBlurPlaceholder(1280, 800);
  const trustScore = report.aiAnalysis?.risk?.score;
  const globalRank = report.radar?.globalRank ?? report.trafficData?.globalRank;
  const category = report.taxonomy?.iabCategory;
  const sentiment = report.aiAnalysis?.risk?.sentiment;

  return (
    <section className={cn('overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm', className)}>
      <div className="grid gap-0 lg:grid-cols-[380px_1fr]">
        <div className="border-b border-slate-200 lg:border-b-0 lg:border-r">
          <div className="relative aspect-[16/10] bg-slate-100">
            <Image
              src={screenshotUrl}
              alt={`Screenshot of ${domain}`}
              fill
              sizes="(max-width: 1024px) 100vw, 380px"
              className="object-cover object-top"
              placeholder="blur"
              blurDataURL={blurPlaceholder}
              priority
              unoptimized={screenshotUrl.includes('thum.io')}
            />
          </div>
        </div>

        <div className="p-5 md:p-7">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Image src={faviconUrl} alt={`${domain} logo`} width={20} height={20} className="h-5 w-5 rounded-sm" unoptimized />
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Live website intelligence</p>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <h1 className="truncate text-2xl font-semibold text-slate-950 md:text-3xl">{domain}</h1>
                <a
                  href={`https://${domain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Open ${domain} in a new tab`}
                  className="text-slate-400 transition-colors hover:text-slate-700"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
              {report.meta?.title && <p className="mt-3 text-base font-medium text-slate-800">{report.meta.title}</p>}
              {report.meta?.description && <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">{report.meta.description}</p>}
            </div>

            <div className="grid gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2 xl:min-w-[300px]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Last refresh</p>
                <p className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Clock className="h-4 w-4 text-slate-400" />
                  Updated {getRelativeTime(updatedAt)}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Analyst read</p>
                <p className="mt-2 text-sm font-medium text-slate-700">{sentiment ?? 'In review'}</p>
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {typeof globalRank === 'number' && globalRank > 0 && (
              <span className={`${factPillClass} border-blue-200 bg-blue-50 text-blue-700`}>
                <BarChart3 className="mr-1.5 h-3.5 w-3.5" />#{formatNumber(globalRank)} global rank
              </span>
            )}
            {typeof trustScore === 'number' && (
              <span className={`${factPillClass} border-emerald-200 bg-emerald-50 text-emerald-700`}>
                <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />{trustScore}/100 trust
              </span>
            )}
            {category && (
              <span className={`${factPillClass} border-slate-200 bg-slate-50 text-slate-700`}>
                {category}
              </span>
            )}
            {isStale && (
              <span className={`${factPillClass} border-amber-200 bg-amber-50 text-amber-700`}>
                <RefreshCw className="mr-1.5 h-3 w-3" />Stale snapshot
              </span>
            )}
          </div>

          {techStack.length > 0 && (
            <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                <Layers3 className="h-4 w-4" />Detected stack
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {techStack.slice(0, 8).map((tech) => {
                  const slug = normalizeDirectorySlug(tech);
                  return slug ? (
                    <Link
                      key={tech}
                      href={`/directory/technology/${slug}`}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 transition-colors hover:border-clay-200 hover:text-clay-700"
                    >
                      {tech}
                    </Link>
                  ) : (
                    <span key={tech} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700">
                      {tech}
                    </span>
                  );
                })}
                {techStack.length > 8 && (
                  <Link
                    href={`/data/${domain}/tech`}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-500 transition-colors hover:text-clay-700"
                  >
                    +{techStack.length - 8} more
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
