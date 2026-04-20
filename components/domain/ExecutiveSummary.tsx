import React from 'react';
import type { SiteReport } from '@/lib/api-client/types';
import { buildExecutiveSummary } from '@/lib/pseo';

interface ExecutiveSummaryProps {
  domain: string;
  report: SiteReport;
}

export function ExecutiveSummary({ domain, report }: ExecutiveSummaryProps) {
  const content = buildExecutiveSummary(domain, report);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.9fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-clay-600">Quick read</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">{content.title}</h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600">{content.summary}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-900">What to do next</p>
          <ul className="mt-3 space-y-3 text-sm leading-relaxed text-slate-600">
            {content.bullets.map((bullet) => (
              <li key={bullet} className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-clay-500" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
