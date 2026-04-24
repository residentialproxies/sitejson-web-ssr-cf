import React from 'react';
import { Code as Code2, Database, Cpu, Server, Zap } from 'lucide-react';
import { FREE_RATE_LIMIT_RPM, FREE_STARTER_CREDITS, PRO_MONTHLY_QUOTA } from '@/lib/auth/session';
import { RESEARCH_SIGNAL_CARDS } from '@/lib/pseo';

const stackItems = [
  { label: 'Node.js', icon: Server, color: 'text-emerald-600' },
  { label: 'Python', icon: Code2, color: 'text-blue-600' },
  { label: 'Go', icon: Zap, color: 'text-sky-500' },
  { label: 'Rust', icon: Cpu, color: 'text-orange-600' },
  { label: 'PHP', icon: Database, color: 'text-blue-500' },
] as const;

const proofStats = [
  { label: 'Starter requests', value: String(FREE_STARTER_CREDITS), detail: 'Run real reports before you write a single line of integration code.' },
  { label: 'Free rate limit', value: `${FREE_RATE_LIMIT_RPM} req/min`, detail: 'Enough headroom for manual research and analyst workflows.' },
  { label: 'Pro quota', value: `${PRO_MONTHLY_QUOTA}/cycle`, detail: 'Built for high-volume enrichment jobs and automated pipelines.' },
  { label: 'Browse surfaces', value: '3 hubs', detail: 'Category, technology, and topic paths — no domain name required.' },
] as const;

export function ResearchSignalsSection() {
  return (
    <section className="border-y border-slate-200 bg-white py-20">
      <div className="container mx-auto max-w-7xl px-4 md:px-6">

        {/* Header */}
        <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-clay-600">Why SiteJSON</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-900 md:text-4xl">
              Built for evidence-driven research, not shallow enrichment.
            </h2>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-600">
              Most domain lookup tools give you one metric and send you home. SiteJSON builds a full research environment — connected hubs, structured reports, and comparison tools — so every visit ends with a better decision.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">The difference</p>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
              <li className="flex items-start gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-clay-500" />
                Validate data quality with live reports before committing to an API key.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-clay-500" />
                Search visitors land on pages that function as tools, not thin funnels.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-clay-500" />
                Pivot from any domain into adjacent markets, tech stacks, and alternatives.
              </li>
            </ul>
          </div>
        </div>

        {/* Proof stats */}
        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {proofStats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-slate-100 bg-slate-50 p-6 transition hover:border-clay-200 hover:shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{stat.label}</p>
              <p className="mt-3 font-mono text-3xl font-bold tracking-tight text-slate-950">{stat.value}</p>
              <p className="mt-3 text-sm leading-6 text-slate-600">{stat.detail}</p>
            </div>
          ))}
        </div>

        {/* Research signal cards */}
        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {RESEARCH_SIGNAL_CARDS.map((card) => (
            <div key={card.title} className="rounded-2xl border border-clay-100 bg-clay-50/60 p-6 transition hover:border-clay-200 hover:bg-clay-50">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-clay-700">{card.value}</p>
              <h3 className="mt-3 text-xl font-semibold text-slate-900">{card.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{card.description}</p>
            </div>
          ))}
        </div>

        {/* Developer footer strip */}
        <div className="mt-10 flex flex-col gap-5 rounded-2xl border border-slate-200 bg-slate-950 px-6 py-5 text-white md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Works with any stack</p>
            <p className="mt-2 text-sm text-slate-300">
              A standard REST API returning clean JSON — integrate it in minutes from any language or runtime.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {stackItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 transition hover:bg-white/10">
                  <Icon size={16} className={item.color} />
                  <span className="text-sm font-semibold text-slate-100">{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
