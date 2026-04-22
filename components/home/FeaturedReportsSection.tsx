import React from 'react';
import type { Route } from 'next';
import Link from 'next/link';
import { ArrowRight, Globe as Globe2 } from 'lucide-react';
import { FEATURED_REPORTS } from '@/lib/pseo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

export function FeaturedReportsSection() {
  return (
    <section className="border-y border-slate-200 bg-slate-50 py-20">
      <div className="container mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-end mb-10">
          <div className="max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-clay-600">Live site data examples</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-900 md:text-4xl">
              Real domains. Real site data.
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-slate-600">
              Each example below shows a different type of analysis: AI product, B2B infrastructure, design SaaS, and developer tools.
              Open any report to see all six data layers live.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">What you see in each report</p>
            <ul className="mt-3 space-y-1.5 text-sm text-slate-600">
              {[
                'Traffic estimates and global ranking',
                'Technology stack (500+ signatures)',
                'SEO structure: headings, links, meta',
                'DNS infrastructure and nameservers',
                'AI trust score and business classification',
                'Advertiser and publisher network signals',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 leading-6">
                  <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-clay-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Link href="/directory" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-clay-700 hover:text-clay-800">
              Explore all browse paths <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {FEATURED_REPORTS.map((report) => (
            <Link key={report.domain} href={report.href as Route} className="block h-full">
              <Card hover className="h-full rounded-3xl border-slate-200 bg-white">
                <CardHeader>
                  <div className="flex items-center justify-between gap-3">
                    <div className="inline-flex items-center gap-2 text-clay-700">
                      <Globe2 size={16} />
                      <span className="text-sm font-semibold uppercase tracking-[0.16em]">{report.domain}</span>
                    </div>
                    <span className="rounded-full bg-clay-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-clay-700">
                      {report.vertical}
                    </span>
                  </div>
                  <CardTitle className="text-xl">{report.title}</CardTitle>
                  <CardDescription>{report.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex h-full flex-col gap-4 text-sm text-slate-700">
                  <ul className="space-y-2">
                    {report.signals.map((signal) => (
                      <li key={signal} className="flex items-start gap-2 leading-6">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-clay-400" />
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
