import React from 'react';
import type { FaqEntry } from '@/lib/pseo';

interface FaqSectionProps {
  title: string;
  description: string;
  items: FaqEntry[];
}

export function FaqSection({ title, description, items }: FaqSectionProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-clay-600">FAQ</p>
        <h2 className="mt-3 text-2xl font-semibold text-slate-900 md:text-3xl">{title}</h2>
        <p className="mt-3 text-base leading-relaxed text-slate-600">{description}</p>
      </div>
      <div className="mt-8 space-y-3">
        {items.map((item) => (
          <details key={item.question} className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 group">
            <summary className="cursor-pointer list-none text-left text-base font-medium text-slate-900">
              <span className="inline-flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-clay-500 transition-transform group-open:scale-125" />
                {item.question}
              </span>
            </summary>
            <p className="mt-3 pl-5 text-sm leading-relaxed text-slate-600">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
