import React from 'react';
import { Code2, Database, Cpu, Server, Zap } from 'lucide-react';
import { FREE_RATE_LIMIT_RPM, FREE_STARTER_CREDITS, PRO_MONTHLY_QUOTA } from '@/lib/auth/session';
import { RESEARCH_SIGNAL_CARDS } from '@/lib/pseo';

const stackItems = [
  { label: 'Node.js', icon: Server, color: 'text-emerald-600' },
  { label: 'Python', icon: Code2, color: 'text-blue-600' },
  { label: 'Go', icon: Zap, color: 'text-sky-500' },
  { label: 'Rust', icon: Cpu, color: 'text-orange-600' },
  { label: 'PHP', icon: Database, color: 'text-indigo-500' },
] as const;

const proofStats = [
  { label: 'Starter requests', value: String(FREE_STARTER_CREDITS), detail: 'Try live reports before integrating.' },
  { label: 'Free plan rate', value: `${FREE_RATE_LIMIT_RPM} req/min`, detail: 'Enough for manual analyst workflows.' },
  { label: 'Pro quota', value: `${PRO_MONTHLY_QUOTA}/cycle`, detail: 'Built for repeatable enrichment jobs.' },
  { label: 'Browse surfaces', value: '3 hubs', detail: 'Category, technology, and topic paths.' },
] as const;

export function ResearchSignalsSection() {
  return (
    <section className="border-y border-slate-200 bg-white py-20">
      <div className="container mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-clay-600">Research signals</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-900 md:text-4xl">
              Built for evidence-driven website analysis, not shallow enrichment.
            </h2>
            <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-600">
              The best site-data products make it easy to move from discovery to judgment. SiteJSON now emphasizes
              reusable browse hubs, structured report modules, and internal paths that help visitors stay in research
              mode.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Why this matters</p>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
              <li>Buyers can validate report quality before requesting an API key.</li>
              <li>Search visitors land on pages that feel like tools instead of thin landing pages.</li>
              <li>Analysts can pivot from one domain into adjacent markets, technologies, and alternatives.</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {proofStats.map((stat) => (
            <div key={stat.label} className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">{stat.label}</p>
              <p className="mt-3 font-mono text-3xl font-bold tracking-tight text-slate-950">{stat.value}</p>
              <p className="mt-3 text-sm leading-6 text-slate-600">{stat.detail}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {RESEARCH_SIGNAL_CARDS.map((card) => (
            <div key={card.title} className="rounded-3xl border border-clay-100 bg-clay-50/70 p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-clay-700">{card.value}</p>
              <h3 className="mt-3 text-2xl font-semibold text-slate-900">{card.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{card.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-5 rounded-3xl border border-slate-200 bg-slate-950 px-6 py-5 text-white md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Developer-ready outputs</p>
            <p className="mt-2 text-base text-slate-200">
              Structured JSON is useful only when the product experience also teaches visitors what the data means.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            {stackItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                  <Icon size={18} className={item.color} />
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
