'use client';

import React from 'react';
import Image from 'next/image';
import { ExternalLink, Clock, RefreshCw } from 'lucide-react';
import { cn, getRelativeTime, getScreenshotUrl, getFaviconUrl, generateBlurPlaceholder } from '@/lib/utils';
import type { SiteReport } from '@/lib/api-client/types';

interface DomainHeaderProps {
  domain: string;
  report: SiteReport;
  updatedAt: string;
  isStale: boolean;
  className?: string;
}

export function DomainHeader({ domain, report, updatedAt, isStale, className }: DomainHeaderProps) {
  const screenshotUrl = report.visual?.screenshotUrl
    || getScreenshotUrl(domain, 'large', { format: 'webp', quality: 85 });
  const faviconUrl = getFaviconUrl(domain, 32);
  const techStack = report.meta?.techStackDetected ?? [];
  const blurPlaceholder = generateBlurPlaceholder(1280, 800);

  return (
    <div className={cn('bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden', className)}>
      <div className="flex flex-col md:flex-row">
        {/* Screenshot */}
        <div className="md:w-80 lg:w-96 flex-shrink-0 border-b md:border-b-0 md:border-r border-gray-200">
          <div className="relative aspect-[16/10] bg-gray-100">
            <Image
              src={screenshotUrl}
              alt={`Screenshot of ${domain}`}
              fill
              sizes="(max-width: 768px) 100vw, 384px"
              className="object-cover object-top"
              placeholder="blur"
              blurDataURL={blurPlaceholder}
              priority
              unoptimized={screenshotUrl.includes('thum.io')}
            />
          </div>
        </div>

        {/* Meta Info */}
        <div className="flex-1 p-4 md:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Image
                  src={faviconUrl}
                  alt=""
                  width={20}
                  height={20}
                  className="w-5 h-5 rounded-sm"
                  unoptimized
                />
                <h1 className="text-xl font-semibold text-gray-900 truncate">{domain}</h1>
                <a
                  href={`https://${domain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
              {report.meta?.title && (
                <h2 className="text-base font-medium text-gray-800 mb-2 line-clamp-1">
                  {report.meta.title}
                </h2>
              )}
              {report.meta?.description && (
                <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                  {report.meta.description}
                </p>
              )}
            </div>
          </div>

          {/* Tech Stack */}
          {techStack.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {techStack.slice(0, 8).map((tech) => (
                <span
                  key={tech}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700 border border-gray-200"
                >
                  {tech}
                </span>
              ))}
              {techStack.length > 8 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-50 text-gray-500">
                  +{techStack.length - 8} more
                </span>
              )}
            </div>
          )}

          {/* Last Updated */}
          <div className="flex items-center gap-3 mt-4">
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Clock className="w-3.5 h-3.5" />
              <span>Updated {getRelativeTime(updatedAt)}</span>
            </div>
            {isStale && (
              <span className="inline-flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                <RefreshCw className="w-3 h-3" />
                Stale
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
