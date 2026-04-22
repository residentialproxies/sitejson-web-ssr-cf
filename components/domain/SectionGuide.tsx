import React from 'react';
import type { ReportSectionKey } from '@/lib/pseo';
import { REPORT_SECTION_COPY } from '@/lib/pseo';

interface SectionGuideProps {
  section: ReportSectionKey;
}

export function SectionGuide({ section }: SectionGuideProps) {
  const content = REPORT_SECTION_COPY[section];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-clay-600">Why this module matters</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">{content.title}</h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600">{content.summary}</p>
        </div>
        <ul className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-600">
          {content.bullets.map((bullet) => (
            <li key={bullet} className="flex gap-3">
              <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-sage-500" aria-hidden="true" />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
