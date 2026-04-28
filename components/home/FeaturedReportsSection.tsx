import React from 'react';
import type { Route } from 'next';
import Link from 'next/link';
import { ArrowRight, Globe2 } from 'lucide-react';
import { FEATURED_REPORTS } from '@/lib/pseo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

export function FeaturedReportsSection() {
  return (
    <section className="border-y border-slate-200 bg-slate-50 py-20">
      <div className="container mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-clay-600">Live report walkthroughs</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-900 md:text-4xl">
              Real domains make the product promise feel concrete.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-slate-600">
              Each example below is selected to show a different analysis use case: category leadership, developer tools,
              B2B infrastructure, and design SaaS. That mix gives visitors a more professional read on the dataset.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Professional pSEO pattern</p>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Good aggregator pages should teach the product, showcase the data model, and route readers into deeper
              pages. These report cards are designed to do all three.
            </p>
            <Link href="/directory" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-clay-700 hover:text-clay-800">
              Explore all browse paths <ArrowRight size={16} />
            </Link>
          </div>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {FEATURED_REPORTS.map((report) => (
            <Link key={report.domain} href={report.href as Route} className="block h-full">
              <Card hover className="h-full rounded-3xl border-slate-200 bg-white">
                <CardHeader>
                  <div className="flex items-center justify-between gap-3">
                    <div className="inline-flex items-center gap-2 text-clay-700">
                      <Globe2 size={18} />
                      <span className="text-sm font-semibold uppercase tracking-[0.16em]">{report.domain}</span>
                    </div>
                    <span className="rounded-full bg-clay-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-clay-700">
                      {report.vertical}
                    </span>
                  </div>
                  <CardTitle className="text-2xl">{report.title}</CardTitle>
                  <CardDescription>{report.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex h-full flex-col gap-4 text-sm text-slate-700">
                  <ul className="space-y-2">
                    {report.signals.map((signal) => (
                      <li key={signal} className="flex items-start gap-2 leading-6">
                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-clay-500" />
                        <span>{signal}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Best for</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{report.bestFor}</p>
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
