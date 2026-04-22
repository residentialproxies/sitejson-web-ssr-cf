import React from 'react';
import { Code as Code2, Database, Cpu, Server, Zap } from 'lucide-react';
import { FREE_RATE_LIMIT_RPM, FREE_STARTER_CREDITS, PRO_MONTHLY_QUOTA } from '@/lib/auth/session';

const stackItems = [
  { label: 'Node.js', icon: Server, color: 'text-emerald-400' },
  { label: 'Python', icon: Code2, color: 'text-blue-400' },
  { label: 'Go', icon: Zap, color: 'text-sky-400' },
  { label: 'Rust', icon: Cpu, color: 'text-orange-400' },
  { label: 'PHP', icon: Database, color: 'text-blue-400' },
] as const;

const proofStats = [
  { label: 'Starter requests', value: String(FREE_STARTER_CREDITS), detail: 'Free lookups before you need an API key.' },
  { label: 'Free plan rate', value: `${FREE_RATE_LIMIT_RPM} req/min`, detail: 'Sufficient for manual analyst research.' },
  { label: 'Pro quota', value: `${PRO_MONTHLY_QUOTA}/cycle`, detail: 'Scalable enrichment for production pipelines.' },
  { label: 'Data categories', value: '6 layers', detail: 'Traffic, SEO, tech, DNS, business, and trust.' },
] as const;

const dataLayers = [
  {
    value: 'Traffic',
    title: 'Monthly visits & rankings',
    description: 'Estimated monthly visitors, global and country rank, bounce rate, avg visit duration, and traffic source breakdown.',
  },
  {
    value: 'Tech stack',
    title: '500+ tech signatures',
    description: 'Frameworks, CMS, CDN, analytics tools, payment processors, A/B testing, chat widgets, and more.',
  },
  {
    value: 'SEO structure',
    title: 'Heading maps & link counts',
    description: 'H1/H2 hierarchy, internal and external link counts, meta tag quality, robots.txt, and sitemap detection.',
  },
  {
    value: 'Trust scoring',
    title: 'AI legitimacy score 0-100',
    description: 'Domain age, SSL health, content quality, contact extraction, DNS reputation, and spam signal detection.',
  },
] as const;

export function ResearchSignalsSection() {
  return (
    <section className="border-y border-slate-200 bg-white py-20">
      <div className="container mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-clay-600">What you get back</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-900 md:text-4xl">
              Six data layers. One structured JSON response per domain.
            </h2>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-slate-600">
              Every lookup returns traffic estimates, SEO signals, technology fingerprints, DNS infrastructure,
              AI-generated business context, and a legitimacy trust score — all normalized into a consistent schema.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Why structured matters</p>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
              <li>Each field maps directly to an API response key — no parsing guesswork.</li>
              <li>Consistent schema means the same logic works on any domain you analyze.</li>
              <li>Browse the visual report, then switch to the API without learning a new model.</li>
            </ul>
          </div>
        </div>

        {/* Proof stats */}
        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {proofStats.map((stat) => (
            <div key={stat.label} className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">{stat.label}</p>
              <p className="mt-3 font-mono text-3xl font-bold tracking-tight text-slate-950">{stat.value}</p>
              <p className="mt-3 text-sm leading-6 text-slate-600">{stat.detail}</p>
            </div>
          ))}
        </div>

        {/* Data layer cards */}
        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {dataLayers.map((card) => (
            <div key={card.title} className="rounded-3xl border border-clay-100 bg-clay-50/70 p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-clay-700">{card.value}</p>
              <h3 className="mt-3 text-xl font-semibold text-slate-900">{card.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{card.description}</p>
            </div>
          ))}
        </div>

        {/* Developer bar */}
        <div className="mt-10 flex flex-col gap-5 rounded-3xl border border-slate-200 bg-slate-950 px-6 py-5 text-white md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">REST API — any language</p>
            <p className="mt-2 text-base text-slate-200">
              The same JSON you see in the visual report is available through the API. Works with any HTTP client.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {stackItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
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
