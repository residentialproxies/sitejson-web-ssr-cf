import React from 'react';
import type { Route } from 'next';
import Link from 'next/link';
import type { LinkCard } from '@/lib/pseo';

interface RelatedResourcesProps {
  title: string;
  description: string;
  items: LinkCard[];
}

export function RelatedResources({ title, description, items }: RelatedResourcesProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-clay-600">Keep exploring</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">{title}</h2>
        <p className="mt-3 text-base leading-relaxed text-slate-600">{description}</p>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href as Route}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-colors hover:border-clay-300 hover:bg-clay-50"
          >
            {item.eyebrow && (
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-clay-700">{item.eyebrow}</p>
            )}
            <p className="mt-1 text-sm font-semibold text-slate-900">{item.label}</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.description}</p>
            {item.reason && (
              <p className="mt-3 text-xs leading-relaxed text-slate-500">{item.reason}</p>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
