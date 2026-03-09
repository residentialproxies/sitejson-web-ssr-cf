'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { ArrowRight, BarChart3, Layers3, Search, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { FREE_RATE_LIMIT_RPM, FREE_STARTER_CREDITS } from '@/lib/auth/session';

type CodeViewerProps = { domain: string };

const demoDomains = ['openai.com', 'stripe.com', 'vercel.com', 'figma.com'] as const;
const quickLinks = [
  { href: '/directory', label: 'Browse directory' },
  { href: '/directory/technology', label: 'Tech stacks' },
  { href: '/directory/topic', label: 'Topics' },
  { href: '/data/openai.com', label: 'Sample report' },
] as const;
const heroSignals = [
  { label: 'Traffic context', value: 'Estimated visits, rank, audience', icon: BarChart3 },
  { label: 'SEO structure', value: 'Detected indexability and links', icon: Search },
  { label: 'Trust posture', value: 'Measured and detected risk signals', icon: ShieldCheck },
] as const;

const CodeViewerFallback = () => (
  <div className="h-full min-h-[360px] w-full rounded-[1.75rem] border border-slate-200 bg-white/70 shadow-xl" />
);

const DeferredCodeViewer = dynamic<CodeViewerProps>(
  () => import('./CodeViewer').then((mod) => mod.CodeViewer),
  { ssr: false, loading: () => <CodeViewerFallback /> },
);

const normalizeDomain = (value: string): string => (
  value.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]
);

const isValidDomain = (value: string): boolean => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/.test(value);

export const HeroSection: React.FC = () => {
  const [demoDomain, setDemoDomain] = useState<string>(demoDomains[0]);
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');
  const [shouldRenderCodeViewer, setShouldRenderCodeViewer] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const timer = window.setTimeout(() => setShouldRenderCodeViewer(true), 250);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (inputValue) return;
    let index = 0;
    const interval = window.setInterval(() => {
      index = (index + 1) % demoDomains.length;
      setDemoDomain(demoDomains[index]);
    }, 2800);
    return () => window.clearInterval(interval);
  }, [inputValue]);

  const handleAnalyze = (event: React.FormEvent) => {
    event.preventDefault();
    const cleanDomain = normalizeDomain(inputValue || demoDomain);
    if (!isValidDomain(cleanDomain)) {
      setError('Enter a valid domain like linear.app or https://linear.app');
      return;
    }
    setError('');
    router.push(`/data/${cleanDomain}`);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
    if (error) setError('');
  };

  const displayDomain = inputValue || demoDomain;

  return (
    <section className="relative overflow-hidden bg-clay-50 pb-24 pt-16 lg:pb-28 lg:pt-24">
      <div className="absolute inset-0 gradient-mesh" />
      <div className="absolute inset-0 noise-overlay pointer-events-none" />
      <div className="container relative z-10 mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="flex flex-col gap-6">
            <Badge variant="clay" dot pulse className="w-fit">
              Website intelligence for analysts, buyers, and growth teams
            </Badge>
            <div>
              <h1 className="max-w-4xl font-serif font-medium leading-[1.02] text-ink-900">
                Compare websites with a <span className="text-gradient">research-grade workflow</span>.
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-600">
                Inspect any website with estimated traffic, detected SEO structure, technology signals, business context, and trust scoring. Start with a live report now, then move into directories, comparisons, and API workflows when you need more coverage.
              </p>
            </div>

            <form onSubmit={handleAnalyze} className="max-w-xl">
              <label htmlFor="hero-domain" className="sr-only">Analyze a domain</label>
              <div className="relative rounded-[1.5rem] border border-white/70 bg-white/85 p-2 shadow-xl shadow-clay-100/60 backdrop-blur">
                <div className="pointer-events-none absolute left-6 top-1/2 -translate-y-1/2 text-ink-400">
                  <Search size={20} />
                </div>
                <input
                  id="hero-domain"
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  aria-invalid={error ? 'true' : 'false'}
                  aria-describedby="hero-domain-help hero-domain-error"
                  placeholder={`Try ${demoDomain}`}
                  className="block w-full rounded-[1.1rem] bg-transparent py-4 pl-12 pr-32 text-lg font-medium text-ink-900 outline-none placeholder:text-ink-400"
                />
                <div className="absolute inset-y-2 right-2">
                  <Button type="submit" variant="clay" className="h-full rounded-xl px-6 font-semibold" shimmer>
                    Analyze website
                  </Button>
                </div>
              </div>
              <p id="hero-domain-help" className="mt-3 text-sm text-ink-500">
                Start with one live report now, then unlock {FREE_STARTER_CREDITS} starter requests and {FREE_RATE_LIMIT_RPM} req/min when you want to operationalize the workflow in the API.
              </p>
              <p id="hero-domain-error" className={`mt-2 text-sm ${error ? 'text-rose-600' : 'text-transparent'}`}>
                {error || 'Valid domain format required'}
              </p>
            </form>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Link href="/directory">
                <Button size="lg" variant="clay" glow>
                  Browse markets first
                  <ArrowRight size={18} />
                </Button>
              </Link>
              <Link href="/data/openai.com">
                <Button variant="outline" size="lg">View sample report</Button>
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-sm text-ink-700">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-500">Best first step</p>
                <p className="mt-1 font-semibold text-ink-900">Open one live report</p>
                <p className="mt-1 text-ink-600">Validate the signal quality before you commit to the API.</p>
              </div>
              <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-sm text-ink-700">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-500">Best buyer path</p>
                <p className="mt-1 font-semibold text-ink-900">Browse adjacent competitors</p>
                <p className="mt-1 text-ink-600">Use category, topic, and technology hubs to build a shortlist quickly.</p>
              </div>
              <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-sm text-ink-700">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-500">Best API proof</p>
                <p className="mt-1 font-semibold text-ink-900">Reuse the same workflow</p>
                <p className="mt-1 text-ink-600">The report, compare, and directory views map directly to structured JSON outputs.</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {quickLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="inline-flex items-center rounded-full border border-ink-200 bg-white/70 px-4 py-2 text-sm font-semibold text-ink-700 transition hover:border-clay-200 hover:text-clay-700"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/60 bg-white/80 p-4 shadow-2xl shadow-clay-100/70 backdrop-blur">
            <div className="grid gap-3 sm:grid-cols-3">
              {heroSignals.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <Icon size={18} className="text-clay-600" />
                    <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
                    <p className="mt-2 text-sm font-medium leading-6 text-slate-700">{item.value}</p>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 rounded-[1.6rem] border border-slate-200 bg-slate-950 p-4 text-white shadow-inner">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Live report preview</p>
                  <p className="mt-1 text-sm text-slate-200">See how the same dataset turns into a conversion-ready analyst workflow.</p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200">
                  <Layers3 size={14} />
                  {displayDomain}
                </div>
              </div>
              <div className="min-h-[360px]">
                {shouldRenderCodeViewer ? <DeferredCodeViewer domain={displayDomain} /> : <CodeViewerFallback />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
