import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { DirectoryItem } from '../../lib/api-client/types';
import { Card } from '../ui/Card';
import { formatNumber } from '../../lib/utils';
import { Globe } from 'lucide-react';

interface SiteCardProps {
  site: DirectoryItem;
}

const screenshotUrl = (domain: string) =>
  `https://image.thum.io/get/width/600/noanimate/https://${domain}`;

export const SiteCard: React.FC<SiteCardProps> = ({ site }) => {
  return (
    <Link href={`/data/${site.domain}`} className="group block h-full">
      <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-md hover:border-slate-300 group-hover:-translate-y-1">
        <div className="relative h-32 bg-slate-100 border-b border-slate-100 overflow-hidden">
          <Image
            src={screenshotUrl(site.domain)}
            alt={site.domain}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="w-full h-full object-cover object-top opacity-90 transition-opacity group-hover:opacity-100"
          />
          {typeof site.rank === 'number' && site.rank > 0 && (
            <div className="absolute top-3 left-3">
              <span className="bg-white/90 backdrop-blur text-slate-900 text-[10px] font-bold px-2 py-1 rounded shadow-sm border border-slate-200">
                #{formatNumber(site.rank)}
              </span>
            </div>
          )}
          {typeof site.score === 'number' && (
            <div className="absolute top-3 right-3">
              <span className="bg-white/90 backdrop-blur text-slate-700 text-[10px] font-mono font-bold px-2 py-1 rounded shadow-sm border border-slate-200">
                {site.score}/100
              </span>
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Image
              src={`https://www.google.com/s2/favicons?domain=${site.domain}&sz=32`}
              alt=""
              width={16}
              height={16}
              className="w-4 h-4 rounded-sm"
            />
            <h3 className="font-bold text-slate-900 truncate">{site.domain}</h3>
          </div>

          <p className="text-xs text-slate-500 line-clamp-2 mb-4 h-8 leading-relaxed">
            {site.title || site.domain}
          </p>

          <div className="flex items-center justify-between pt-2 border-t border-slate-50 mt-auto">
             <div className="flex items-center gap-1 text-xs text-slate-400">
                <Globe size={12} />
                <span>{site.domain}</span>
             </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};
