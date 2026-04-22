import React from 'react';
import type { Route } from 'next';
import Link from 'next/link';
import { ArrowRight, ChartBar as BarChart2, Search, Layers, Database } from 'lucide-react';

const useCases = [
  {
    icon: Search,
    eyebrow: 'Lead qualification',
    title: 'Qualify prospects with site data',
    description:
      'Look up any domain to verify traffic scale, tech stack, business category, and trust score before your team spends time on outreach. Filter out low-quality leads with evidence.',
    cta: 'Try a live report',
    href: '/data/openai.com',
    color: 'bg-clay-100 text-clay-600',
  },
  {
    icon: BarChart2,
    eyebrow: 'Competitive research',
    title: 'Map a market in minutes',
    description:
      'Start from a category or technology directory, open live reports, compare traffic estimates, SEO structure, and tech signals across competitors — all in one workflow.',
    cta: 'Browse directory',
    href: '/directory',
    color: 'bg-sage-100 text-sage-600',
  },
  {
    icon: Layers,
    eyebrow: 'Tech stack intelligence',
    title: 'Discover what sites run on',
    description:
      'Detect frameworks, CDN, analytics, payments, CMS, and 500+ other technology signatures. Browse sites grouped by shared tech to find clusters, vendors, and buyers.',
    cta: 'Explore tech stacks',
    href: '/directory/technology',
    color: 'bg-ochre-100 text-ochre-600',
  },
  {
    icon: Database,
    eyebrow: 'API enrichment',
    title: 'Enrich your product with site data',
    description:
      'Pull structured JSON from the API and enrich your CRM, data pipeline, or product. The same fields you see in the visual report are available as clean, typed API responses.',
    cta: 'View API access',
    href: '/#pricing',
    color: 'bg-ink-100 text-ink-600',
  },
] as const;

export function UseCasesSection() {
  return (
    <section className="bg-white py-20">
      <div className="container mx-auto max-w-7xl px-4 md:px-6">
        <div className="max-w-2xl mb-12">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-clay-600">Who uses SiteJSON</p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-900 md:text-4xl">
            Site data for every workflow.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            From single-domain lookups to bulk API enrichment — SiteJSON fits naturally into research, sales, SEO, and developer workflows.
          </p>
        </div>
        <div className="grid gap-5 lg:grid-cols-4 md:grid-cols-2">
          {useCases.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="flex flex-col rounded-3xl border border-slate-200 bg-slate-50/70 p-6 transition hover:border-clay-200 hover:shadow-md"
              >
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl mb-4 ${item.color}`}>
                  <Icon size={20} />
                </div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-clay-600 mb-2">{item.eyebrow}</p>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">{item.title}</h3>
                <p className="text-sm leading-relaxed text-slate-600 flex-1">{item.description}</p>
                <Link
                  href={item.href as Route}
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-clay-700 hover:text-clay-800 transition"
                >
                  {item.cta} <ArrowRight size={15} />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
