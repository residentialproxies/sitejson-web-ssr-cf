import React from 'react';
import Link from 'next/link';
import type { DirectoryItem } from '@/lib/api-client/types';
import { formatNumber } from '@/lib/utils';

interface DirectoryPreviewListProps {
  items: DirectoryItem[];
}

export function DirectoryPreviewList({ items }: DirectoryPreviewListProps) {
  if (items.length === 0) {
    return <p className="text-sm leading-relaxed text-slate-500">No live sites available for this preview yet.</p>;
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <Link
          key={item.domain}
          href={`/data/${item.domain}`}
          className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm transition-colors hover:border-clay-300 hover:bg-clay-50"
        >
          <div>
            <p className="font-semibold text-slate-900">{item.domain}</p>
            <p className="mt-1 text-xs text-slate-500 line-clamp-1">{item.title || item.domain}</p>
          </div>
          <span className="text-xs font-semibold text-slate-500">{item.rank ? `#${formatNumber(item.rank)}` : 'Live report'}</span>
        </Link>
      ))}
    </div>
  );
}
