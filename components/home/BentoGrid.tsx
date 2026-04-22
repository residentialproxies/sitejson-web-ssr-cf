'use client';

import React from 'react';
import { ChartBar as BarChart2, Cpu, Globe, Network, ShieldCheck, FileSearch, Wifi } from 'lucide-react';
import { Card } from '../ui/Card';
import { cn } from '../../lib/utils';

const techBadges = [
  { label: 'React', color: 'bg-clay-100 text-clay-700' },
  { label: 'Next.js', color: 'bg-ink-100 text-ink-700' },
  { label: 'Vercel', color: 'bg-sage-100 text-sage-700' },
  { label: 'Cloudflare', color: 'bg-ochre-100 text-ochre-700' },
  { label: 'Stripe', color: 'bg-clay-100 text-clay-700' },
  { label: 'Intercom', color: 'bg-sage-100 text-sage-700' },
  { label: 'GA4', color: 'bg-ochre-100 text-ochre-700' },
  { label: 'Segment', color: 'bg-ink-100 text-ink-700' },
] as const;

const trafficBars = [38, 62, 45, 78, 55, 91, 67, 84, 72, 96] as const;

const seoRows = [
  { label: 'H1 headings', value: '1' },
  { label: 'H2 headings', value: '8' },
  { label: 'Internal links', value: '142' },
  { label: 'External links', value: '23' },
  { label: 'has robots.txt', value: 'Yes' },
  { label: 'has sitemap.xml', value: 'Yes' },
] as const;

export const BentoGrid: React.FC = () => {
  return (
    <section className="py-24 bg-clay-50/50 relative overflow-hidden">
      <div className="absolute inset-0 noise-overlay pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-sage-100/30 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-clay-100/30 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        <div className="mb-16 text-center max-w-3xl mx-auto">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-clay-600 mb-3">50+ data points per domain</p>
          <h2 className="font-serif font-medium text-ink-900 mb-4">
            One request. Every signal<br />
            <span className="text-ink-400">that matters for a domain.</span>
          </h2>
          <p className="text-lg text-ink-600">
            Traffic, tech stack, SEO structure, DNS infrastructure, advertiser networks, and AI trust scoring — all in a single structured JSON response.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-5 auto-rows-[minmax(170px,auto)]">

          {/* Traffic card — 2 cols wide */}
          <div className="col-span-1 md:col-span-2">
            <Card hover className="h-full p-6 bg-white flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-2 rounded-lg bg-sage-100 text-sage-600">
                      <BarChart2 size={18} />
                    </div>
                    <h3 className="font-serif text-lg font-medium text-ink-900">Traffic Estimates</h3>
                  </div>
                  <p className="text-xs text-ink-500 mt-1 mb-4">Monthly visits, bounce rate, top country, engagement depth</p>
                </div>
                <span className="text-xs font-mono bg-sage-100 text-sage-700 px-2 py-1 rounded-full">+12.4%</span>
              </div>
              <div className="flex items-end gap-1.5 h-20 w-full">
                {trafficBars.map((h, i) => (
                  <div
                    key={i}
                    className={cn('flex-1 rounded-sm transition-all', i === trafficBars.length - 1 ? 'bg-clay-400' : 'bg-sage-200')}
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div>
                  <p className="font-mono text-xl font-bold text-ink-900">1.2M</p>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-400 mt-0.5">Monthly visits</p>
                </div>
                <div>
                  <p className="font-mono text-xl font-bold text-ink-900">38%</p>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-400 mt-0.5">Bounce rate</p>
                </div>
                <div>
                  <p className="font-mono text-xl font-bold text-ink-900">US</p>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-400 mt-0.5">Top country</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Tech fingerprinting card */}
          <div className="col-span-1">
            <Card hover className="h-full p-5 bg-white flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-lg bg-ochre-100 text-ochre-600">
                  <Cpu size={18} />
                </div>
                <h3 className="font-serif text-base font-medium text-ink-900">Tech Stack</h3>
              </div>
              <p className="text-xs text-ink-500 mb-4">500+ signatures across frameworks, CMS, analytics, and payments.</p>
              <div className="flex flex-wrap gap-1.5 mt-auto">
                {techBadges.map((t) => (
                  <span key={t.label} className={cn('rounded-full px-2.5 py-1 text-[11px] font-semibold', t.color)}>
                    {t.label}
                  </span>
                ))}
              </div>
            </Card>
          </div>

          {/* AI trust score */}
          <div className="col-span-1">
            <Card hover className="h-full p-5 bg-ink-900 text-white border-ink-800 flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-lg bg-white/10 text-clay-300">
                  <ShieldCheck size={18} />
                </div>
                <h3 className="font-serif text-base font-medium text-white">AI Trust Score</h3>
              </div>
              <p className="text-xs text-ink-300 mb-5">
                Multi-signal legitimacy scoring: domain age, SSL, DNS reputation, content quality, contact signals.
              </p>
              <div className="mt-auto">
                <div className="flex items-end justify-between mb-2">
                  <span className="text-3xl font-bold font-mono text-white">97</span>
                  <span className="text-xs font-semibold text-sage-400 bg-sage-400/10 px-2 py-1 rounded-full">Professional</span>
                </div>
                <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-[97%] bg-gradient-to-r from-sage-400 to-clay-400 rounded-full" />
                </div>
                <p className="mt-2 text-[10px] text-ink-400">Legitimacy score out of 100</p>
              </div>
            </Card>
          </div>

          {/* SEO structure card */}
          <div className="col-span-1 md:col-span-2">
            <Card hover className="h-full p-5 bg-white flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-lg bg-clay-100 text-clay-600">
                  <FileSearch size={18} />
                </div>
                <h3 className="font-serif text-base font-medium text-ink-900">SEO Structure</h3>
              </div>
              <p className="text-xs text-ink-500 mb-4">Heading hierarchy, link counts, meta quality, robots and sitemap detection.</p>
              <div className="grid grid-cols-3 gap-2 mt-auto">
                {seoRows.map((row) => (
                  <div key={row.label} className="rounded-xl bg-ink-50 border border-ink-100 px-3 py-2">
                    <p className="font-mono text-sm font-bold text-ink-900">{row.value}</p>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-400 mt-0.5 leading-tight">{row.label}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* DNS & Infrastructure */}
          <div className="col-span-1">
            <Card hover className="h-full p-5 bg-white flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-lg bg-ink-100 text-ink-600">
                  <Wifi size={18} />
                </div>
                <h3 className="font-serif text-base font-medium text-ink-900">DNS & Infra</h3>
              </div>
              <p className="text-xs text-ink-500 mb-4">Nameservers, MX records, TXT records, provider fingerprinting.</p>
              <div className="mt-auto space-y-2">
                {[
                  { key: 'NS provider', val: 'Cloudflare' },
                  { key: 'MX', val: 'Google Workspace' },
                  { key: 'TXT', val: '6 records' },
                ].map((r) => (
                  <div key={r.key} className="flex items-center justify-between rounded-lg bg-ink-50 px-3 py-1.5 text-xs">
                    <span className="font-semibold text-ink-500">{r.key}</span>
                    <span className="font-mono font-bold text-ink-800">{r.val}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Ownership & advertiser networks */}
          <div className="col-span-1">
            <Card hover className="h-full p-5 bg-gradient-to-br from-ink-900 to-ink-800 text-white border-ink-800 flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-lg bg-white/10 text-clay-300">
                  <Network size={18} />
                </div>
                <h3 className="font-serif text-base font-medium text-white">Advertiser Networks</h3>
              </div>
              <p className="text-xs text-ink-300 mb-5">
                Detect AdSense IDs, ads.txt publisher networks, and shared ownership signals.
              </p>
              <div className="mt-auto space-y-2">
                <div className="flex items-center justify-between rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 text-xs">
                  <span className="text-ink-300">AdSense ID</span>
                  <span className="font-mono text-clay-300">pub-8192…</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 text-xs">
                  <span className="text-ink-300">Direct partners</span>
                  <span className="font-mono text-sage-400">12 sellers</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Business classification card — spans full width */}
          <div className="col-span-1 md:col-span-4">
            <Card hover className="h-full p-6 bg-white flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="p-3 rounded-xl bg-clay-100 text-clay-600 shrink-0">
                <Globe size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-serif text-lg font-medium text-ink-900 mb-1">Business Classification & Context</h3>
                <p className="text-sm text-ink-500">
                  AI-generated business summary, IAB taxonomy category, target audience, monetization model, and domain age — all extracted automatically from page content and metadata.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">
                {[
                  { label: 'IAB Category', val: 'Technology & Computing' },
                  { label: 'Business model', val: 'SaaS / API' },
                  { label: 'Domain age', val: '8 years' },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl border border-ink-100 bg-ink-50 px-4 py-2 text-center">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-400">{item.label}</p>
                    <p className="mt-1 text-sm font-semibold text-ink-900">{item.val}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

        </div>
      </div>
    </section>
  );
};
