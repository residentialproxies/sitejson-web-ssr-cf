import React from 'react';
import type { Route } from 'next';
import Link from 'next/link';
import { ArrowRight, ExternalLink, Globe as Globe2 } from 'lucide-react';
import { FEATURED_REPORTS } from '@/lib/pseo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

export function FeaturedReportsSection() {
  return (
    <section className="border-y border-slate-200 bg-slate-50 py-20">
      <div className="container mx-auto max-w-7xl px-4 md:px-6">

        {/* Header */}
        <div className="grid gap-8 lg:grid-cols-[1fr_0.85fr] lg:items-end">
          <div className="max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-clay-600">Live report examples</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-900 md:text-4xl">
              Real domains. Real data. No demo mode.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-slate-600">
              Every example below is a live report on a recognizable domain — selected to show how the platform reads across different industries, maturity levels, and use cases.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Why these examples?</p>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Category leadership (OpenAI), platform maturity (Stripe), design SaaS (Figma), and developer infrastructure (Vercel) — four distinct use cases for reading the same structured dataset differently.
            </p>
            <Link href="/directory" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-clay-700 hover:text-clay-800">
              Explore all browse paths <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        {/* Report cards */}
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {FEATURED_REPORTS.map((report) => (
            <Link key={report.domain} href={report.href as Route} className="block h-full group">
              <Card hover className="h-full rounded-2xl border-slate-200 bg-white transition-all group-hover:border-clay-200 group-hover:shadow-md">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="inline-flex items-center gap-2 text-clay-700">
                      <Globe2 size={16} />
                      <span className="text-xs font-bold uppercase tracking-[0.18em]">{report.domain}</span>
                    </div>
                    <span className="rounded-full bg-clay-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-clay-700 border border-clay-100">
                      {report.vertical}
                    </span>
                  </div>
                  <CardTitle className="text-xl">{report.title}</CardTitle>
                  <CardDescription className="leading-relaxed">{report.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex h-full flex-col gap-4 text-sm text-slate-700">
                  <ul className="space-y-2">
                    {report.signals.map((signal) => (
                      <li key={signal} className="flex items-start gap-2 leading-6">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-clay-500" />
                        <span className="text-slate-600">{signal}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto rounded-xl bg-slate-50 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Best for</p>
                    <p className="mt-1.5 text-sm leading-6 text-slate-600">{report.bestFor}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-clay-700 group-hover:text-clay-800">
                    Open live report <ExternalLink size={12} />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
